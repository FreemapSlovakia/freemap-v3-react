/**
 * Field measurement for the freezes seen while a recording is running.
 *
 * `perfWatchdog.ts` says *that* the main thread stalled; this says which of the
 * recorder's passes was underneath it. Each candidate is timed where it happens
 * — the catch-up page, the parse of it, the dispatch that merges it, the frame
 * that draws it — and the slow ones are kept in a small ring that the watchdog
 * attaches to whatever it reports, with anything egregious sent as a report of
 * its own.
 *
 * Numbers and a fixed phase name, deliberately. Sentry's scrubbing eats free
 * text, and the point of a measurement is the size beside it: a pass is slow
 * either because of what it did or because of how long the track had become, and
 * only the point count tells those apart.
 *
 * Temporary: delete once the cause is known.
 */

export interface RecorderSpan {
  /** Which pass, from a fixed set — the label the report groups by. */
  phase: string;
  ms: number;
  /** Points the pass had in hand, where it has a size at all. */
  n?: number;
}

/** Enough to show what led up to a stall without inflating every report. */
const KEEP = 12;

/** Below this a pass is not what anyone felt, whatever else was going on. */
const SLOW_MS = 150;

/**
 * A pass this long is the freeze, and worth a report by itself — a pass that
 * blocks, that is. A wait is kept in the ring for whoever reports a real stall
 * and never sent on its own: it did not block anything, and being the longest
 * measurement by far it would take the session's whole report budget and say
 * something untrue with it.
 */
const REPORT_MS = 800;

const REPORT_THROTTLE_MS = 20_000;

/** A handful per session is all an aggregate needs; the console keeps the rest. */
const MAX_REPORTS = 5;

const spans: RecorderSpan[] = [];

let lastReportAt = 0;

let reportCount = 0;

/**
 * When the page last came back. A measurement that began before it spanned a
 * hidden page, and a hidden page inflates every clock here: `requestAnimationFrame`
 * does not run at all until the page is visible again, and a fetch left in flight
 * is frozen with it. Both would then report minutes of "blocked main thread" for
 * a page that was doing nothing — which is the noise `perfWatchdog.ts` gates its
 * own signals against, for the same reason.
 */
let becameVisibleAt = performance.now();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    becameVisibleAt = performance.now();
  }
});

/** The slow passes so far, oldest first, for a report someone else is making. */
export function recorderSpans(): RecorderSpan[] {
  return [...spans];
}

/** Whether a pass that began at `at` was measured on a page that stayed up. */
function measurable(at: number): boolean {
  return document.visibilityState === 'visible' && at >= becameVisibleAt;
}

function recordSpan(
  phase: string,
  ms: number,
  n: number | undefined,
  blocking: boolean,
): void {
  const span: RecorderSpan = { phase, ms: Math.round(ms), n };

  spans.push(span);

  if (spans.length > KEEP) {
    spans.shift();
  }

  // Always logged, so a developer watching a live session sees it whether or not
  // the remote report is throttled away.
  console.warn('gps recorder perf:', span);

  const now = Date.now();

  if (
    !blocking ||
    span.ms < REPORT_MS ||
    now - lastReportAt < REPORT_THROTTLE_MS ||
    reportCount >= MAX_REPORTS
  ) {
    return;
  }

  lastReportAt = now;

  reportCount += 1;

  // The duration stays out of the message so every occurrence groups into one
  // issue per phase rather than one per millisecond value.
  window.Sentry?.captureMessage(
    `GPS recorder: ${phase} blocked the main thread`,
    {
      level: 'warning',
      tags: {
        perf: 'gps-recorder',
        phase,
        visibility: document.visibilityState,
      },
      extra: { ...span, spans: recorderSpans() },
    },
  );
}

/**
 * Starts timing a pass; the returned function ends it, taking the size the pass
 * turned out to have. Works for a synchronous block and an awaited one alike.
 *
 * `waitMs` marks a phase that is mostly waiting rather than working — a sync
 * spends its time on the wire — and raises the bar to it, because recording
 * every one of those would bury the passes that actually blocked something.
 * Such a pass is never reported as a stall on its own; see {@link REPORT_MS}.
 */
export function startRecorderSpan(
  phase: string,
  waitMs?: number,
): (n?: number) => void {
  const at = performance.now();

  return (n) => {
    const ms = performance.now() - at;

    if (ms >= (waitMs ?? SLOW_MS) && measurable(at)) {
      recordSpan(phase, ms, n, waitMs === undefined);
    }
  };
}

/**
 * How late the next frame is — the freeze as the user meets it, covering the
 * React render and everything Leaflet does with what was just dispatched, none
 * of which happens inside the dispatch itself.
 */
export function watchRecorderFrame(phase: string, n: number): void {
  const at = performance.now();

  requestAnimationFrame(() => {
    const ms = performance.now() - at;

    if (ms >= SLOW_MS && measurable(at)) {
      // The frame is the freeze as the user meets it, so it reports like any
      // other pass that blocked.
      recordSpan(phase, ms, n, true);
    }
  });
}
