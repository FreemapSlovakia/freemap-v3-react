import type { ElevationChartTarget } from '@features/elevationChart/model/target.js';

/**
 * An `elevation-chart=` the URL asked for that nothing could honour yet.
 *
 * It is held here rather than re-read from the address bar, because by then it
 * is gone: `urlProcessor` writes the URL from state, and state has no chart
 * open, so it drops the param long before a saved map's lines arrive. Redux is
 * the wrong home too — this is a scrap of URL-restore coordination, not
 * something the UI renders, and it belongs beside `urlUpdating`'s flag.
 *
 * The rule that matters is when a held request **expires**. Held too briefly it
 * never restores a saved map's drawing; held too long it lies in wait and opens
 * a profile on some line the user draws minutes later, unasked. Both have
 * happened. It lives in its own module so that rule can be tested without a
 * store.
 */
let held: string | null = null;

/**
 * Holds `raw` for later, but only while `mapPending` — a map still to arrive is
 * the one thing that brings content after the URL has been read. Without one,
 * everything the URL describes is already in the store, so a value that doesn't
 * resolve now never will. Always call this when handling a URL: it also clears
 * a stale hold when the new URL supersedes it.
 */
export function holdChartRequest(
  raw: string | null,
  mapPending: boolean,
): void {
  held = raw !== null && mapPending ? raw : null;
}

/**
 * Tries the held request against the store as it is now.
 *
 * Returns the target once it resolves, and forgets it — a request is honoured
 * at most once. Returns `null` while it can't be resolved, and gives it up
 * entirely unless a map is still on its way to deliver what it names.
 */
export function takeChartRequest(
  resolve: (raw: string) => ElevationChartTarget | null,
  mapStillComing: boolean,
): ElevationChartTarget | null {
  if (held === null) {
    return null;
  }

  const target = resolve(held);

  if (target) {
    held = null;

    return target;
  }

  if (!mapStillComing) {
    held = null;
  }

  return null;
}

/** Whether a request is still being held. For tests. */
export function hasChartRequest(): boolean {
  return held !== null;
}
