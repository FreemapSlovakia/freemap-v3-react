import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { trackMatomo } from '@shared/trackMatomo.js';
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

// Timer drift alone is a weak signal: Firefox keeps visibilityState "visible"
// for an occluded or unfocused window while throttling its timers, and a brief
// OS suspend looks the same. A drift below this needs corroboration — either
// Redux work during the stalled tick or a longtask overlapping it — before it
// counts as a real freeze. Above it, a throttled timer is no longer a plausible
// explanation for a focused window, so the drift stands on its own.
const STALL_CORROBORATION_MAX_MS = 10000;

// A longtask seen this recently overlaps the tick that just drifted.
const CORROBORATION_WINDOW_MS = 2000;
let lastLongTaskAt = 0;

// More dispatches than this within a single tick implies a runaway loop.
const STORM_THRESHOLD = 800;

// A single synchronous task longer than this is "high CPU" worth reporting.
const LONGTASK_MS = 1500;

// Don't flood Sentry while a freeze persists.
const REPORT_THROTTLE_MS = 20000;
let lastReportAt = 0;

// The throttle alone still lets a day-long session emit hundreds of reports.
// A handful per session is all the aggregate needs, and the console keeps the
// full picture for anyone debugging live.
const MAX_REMOTE_REPORTS = 5;
let remoteReportCount = 0;

// Bundle parsing and first render are expected to be heavy; ignore the startup
// window so it doesn't drown the signal with a report on every page load.
const WARMUP_MS = 8000;
let startedAt = 0;

/** Records every dispatched action for stall/storm correlation. */
export const perfWatchdogMiddleware: Middleware<object, RootState> =
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
  if (
    now - startedAt < WARMUP_MS ||
    now - lastReportAt < REPORT_THROTTLE_MS ||
    remoteReportCount >= MAX_REMOTE_REPORTS
  ) {
    return;
  }

  lastReportAt = now;

  remoteReportCount += 1;

  window.Sentry?.captureMessage(message, {
    level: 'warning',
    tags: { perf: kind, visibility },
    extra: fullExtra,
  });

  // The full free-text message (with timing numbers) stays in Sentry; Matomo
  // only gets the low-cardinality visibility bucket so the report doesn't
  // fragment into one row per drift value.
  trackMatomo(['trackEvent', 'Perf', kind, visibility]);
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

  // A window that is visible but occluded or unfocused gets its timers throttled
  // too — Firefox notably fires no visibilitychange for it. Tracked alongside
  // `hiddenSinceTick` so a tick whose interval overlapped an unfocused period is
  // skipped as well.
  //
  // Only meaningful at top level: throttling is decided per page, while an
  // iframe's `hasFocus()` reports whether focus sits *inside the frame*. An
  // embed the user hasn't clicked into runs on unthrottled timers yet would
  // never pass the check, so embeds keep the visibility gate alone.
  const focusIsThrottlingSignal = !window.fmEmbedded;

  let unfocusedSinceTick = !document.hasFocus();

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

  window.addEventListener('blur', () => {
    unfocusedSinceTick = true;
  });

  window.addEventListener('focus', () => {
    expected = Date.now() + TICK_MS;
  });

  const tick = () => {
    const now = Date.now();
    const drift = now - expected;
    const actions = tickActionCount;
    const wasVisible = !document.hidden && !hiddenSinceTick;

    // Focus gates the stall branch only, where the signal *is* the timer
    // interval and throttling forges it. A dispatch storm is a runaway loop
    // whichever window has focus, so it stays on the visibility gate — a
    // stretched tick inflates its count but nothing near the threshold.
    const wasFocused =
      !focusIsThrottlingSignal || (document.hasFocus() && !unfocusedSinceTick);

    // Redux work during the stalled tick, or a longtask overlapping it, tells
    // the drift apart from a throttled timer. Browsers without the longtask API
    // only have the former, so a rendering freeze there stays unreported until
    // it passes `STALL_CORROBORATION_MAX_MS` — an aggregate of real freezes is
    // worth more than a complete one drowned in throttling noise.
    const corroborated =
      actions > 0 || now - lastLongTaskAt < CORROBORATION_WINDOW_MS;

    if (
      wasVisible &&
      wasFocused &&
      drift > STALL_MS &&
      drift < STALL_MAX_MS &&
      (drift >= STALL_CORROBORATION_MAX_MS || corroborated)
    ) {
      report('stall', `Main thread stalled for ~${drift} ms`, {
        stallMs: drift,
        actionsDuringStall: actions,
        corroborated,
      });
    } else if (wasVisible && actions > STORM_THRESHOLD) {
      report('storm', `Dispatch storm: ${actions} actions in one tick`, {
        actionsPerTick: actions,
      });
    }

    tickActionCount = 0;

    tickActionTypes.clear();

    hiddenSinceTick = document.hidden;

    unfocusedSinceTick = !document.hasFocus();

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
            // Recorded before the throttle can drop the report, so a suppressed
            // longtask still corroborates the drift the next tick observes.
            lastLongTaskAt = Date.now();

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
