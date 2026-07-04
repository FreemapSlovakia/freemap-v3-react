import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '../store.js';

/**
 * Detects main-thread stalls and Redux dispatch storms in the field and
 * reports them to Sentry / Matomo, so freezes we cannot reproduce locally
 * leave a trace pointing at the action(s) that triggered them.
 *
 * The detector is a cross-browser timer watchdog (works in Firefox, which has
 * no `longtask` API); an additional `longtask` PerformanceObserver gives
 * precise blocking durations on Chromium-based browsers (Chrome, Edge).
 */

// Ring buffer of the most recent dispatched action types, oldest first.
const RECENT_CAP = 60;
const recentActions: { type: string; t: number }[] = [];

// Per-tick counters, reset every watchdog tick.
let tickActionCount = 0;
const tickActionTypes = new Map<string, number>();

// A blocked main thread delays the watchdog by at least this much.
const TICK_MS = 1000;
const STALL_MS = 3000;

// A drift beyond this isn't a main-thread stall the page recovers from — it's a
// wall-clock jump from OS sleep/suspend or extreme timer throttling, neither of
// which fires visibilitychange. Report the plausible-stall band and drop the
// rest so those minutes-to-hours phantom stalls stay out of Sentry.
const STALL_MAX_MS = 60000;

// More dispatches than this within a single tick implies a runaway loop.
const STORM_THRESHOLD = 800;

// A single synchronous task longer than this is "high CPU" worth reporting.
const LONGTASK_MS = 1500;

// Don't flood Sentry while a freeze persists.
const REPORT_THROTTLE_MS = 20000;
let lastReportAt = 0;

// Bundle parsing and first render are expected to be heavy; ignore the startup
// window so it doesn't drown the signal with a report on every page load.
const WARMUP_MS = 8000;
let startedAt = 0;

/** Records every dispatched action for stall/storm correlation. */
export const perfWatchdogMiddleware: Middleware<{}, RootState> =
  () => (next) => (action) => {
    const { type } = action as UnknownAction;

    recentActions.push({ type, t: Date.now() });

    if (recentActions.length > RECENT_CAP) {
      recentActions.shift();
    }

    tickActionCount += 1;

    tickActionTypes.set(type, (tickActionTypes.get(type) ?? 0) + 1);

    return next(action);
  };

function topActionTypes(): string {
  return [...tickActionTypes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `${type}×${count}`)
    .join(', ');
}

function jsHeapMB(): number | undefined {
  // Non-standard, Chromium-only.
  const mem = (performance as { memory?: { usedJSHeapSize: number } }).memory;

  return mem ? Math.round(mem.usedJSHeapSize / 1048576) : undefined;
}

function report(
  kind: 'stall' | 'storm' | 'longtask',
  message: string,
  extra: Record<string, unknown>,
): void {
  const now = Date.now();

  // Page age separates a genuine fresh-session freeze from a tab that has been
  // open for hours (a backgrounded/zombie tab whose timer drift is throttling,
  // not a real stall); visibility tells whether the report fired in the
  // foreground. Both are needed to triage these reports without a release tag.
  const pageAgeMs = Math.round(performance.now());
  const visibility = document.visibilityState;

  const fullExtra = {
    ...extra,
    pageAgeMs,
    visibility,
    topActions: topActionTypes(),
    recentActions: recentActions.map((a) => a.type).join(' → '),
    jsHeapMB: jsHeapMB(),
  };

  // Always log to the console so an affected user can read it live, even
  // during warm-up or while remote reporting is throttled.
  console.warn('perf watchdog:', message, fullExtra);

  // Rate-limit the remote events so a sustained freeze doesn't flood Sentry.
  if (now - startedAt < WARMUP_MS || now - lastReportAt < REPORT_THROTTLE_MS) {
    return;
  }

  lastReportAt = now;

  window.Sentry?.captureMessage(message, {
    level: 'warning',
    tags: { perf: kind, visibility },
    extra: fullExtra,
  });

  // The full free-text message (with timing numbers) stays in Sentry; Matomo
  // only gets the low-cardinality visibility bucket so the report doesn't
  // fragment into one row per drift value.
  window._paq?.push(['trackEvent', 'Perf', kind, visibility]);
}

/** Starts the timer watchdog and (where supported) the longtask observer. */
export function startPerfWatchdog(): void {
  startedAt = Date.now();

  let expected = Date.now() + TICK_MS;

  // Backgrounded tabs have their timers throttled or suspended, so the drift on
  // the first tick after returning to the foreground is just the time spent
  // hidden — not a real main-thread stall. Skip stall/storm evaluation for any
  // tick whose interval overlapped a hidden period, and resync the clock when
  // the tab becomes visible again.
  let hiddenSinceTick = document.hidden;

  // performance.now() of the last foreground transition. A longtask entry whose
  // start predates it overlapped a hidden period and carries the inflated
  // sleep/freeze duration the throttled observer reports, so it is dropped.
  let becameVisibleAt = performance.now();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenSinceTick = true;
    } else {
      expected = Date.now() + TICK_MS;
      becameVisibleAt = performance.now();
    }
  });

  const tick = () => {
    const now = Date.now();
    const drift = now - expected;
    const actions = tickActionCount;
    const wasForeground = !document.hidden && !hiddenSinceTick;

    if (wasForeground && drift > STALL_MS && drift < STALL_MAX_MS) {
      report('stall', `Main thread stalled for ~${drift} ms`, {
        stallMs: drift,
        actionsDuringStall: actions,
      });
    } else if (wasForeground && actions > STORM_THRESHOLD) {
      report('storm', `Dispatch storm: ${actions} actions in one tick`, {
        actionsPerTick: actions,
      });
    }

    tickActionCount = 0;

    tickActionTypes.clear();

    hiddenSinceTick = document.hidden;

    expected = now + TICK_MS;

    setTimeout(tick, TICK_MS);
  };

  setTimeout(tick, TICK_MS);

  if (typeof PerformanceObserver === 'function') {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (document.hidden || entry.startTime < becameVisibleAt) {
            continue;
          }

          if (entry.duration >= LONGTASK_MS) {
            report(
              'longtask',
              `Long task blocked UI for ~${Math.round(entry.duration)} ms`,
              {
                longTaskMs: Math.round(entry.duration),
              },
            );
          }
        }
      });

      // Throws in browsers without longtask support (Firefox, Safari).
      // Not buffered: the load-time long task is expected and uninteresting.
      observer.observe({ type: 'longtask' });
    } catch {
      // No longtask support; the timer watchdog covers these browsers.
    }
  }
}
