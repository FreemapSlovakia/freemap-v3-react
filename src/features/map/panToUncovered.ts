import type { Dispatch } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import { fitLoadedMap, mapToFit } from './fitMapToBbox.js';

// Grid the map is probed on: fine enough to find the gaps between the toolbars,
// and no finer than the margins the answer is measured against — the cell size
// is the only resolution the found rectangle's edges have.
const CELL_PX = 48;

// Ceiling on the hit tests one sweep costs, which it pays for on the click path
// before the browser paints; past it the cells grow instead of multiplying. A 4K
// map is 3600 of them, so this only binds on a screen larger still.
const MAX_CELLS = 4000;

// How far inside the free area a place must sit to count as already visible.
const MARGIN_PX = 40;

// A wider inset for a panel whose press means "show me this": a mark clinging
// to the edge of the free area is still moved to the middle of it.
export const GENEROUS_MARGIN_PX = 100;

type Rect = { x: number; y: number; width: number; height: number };

/**
 * The largest rectangle of the map that nothing floating over it covers, in
 * container coordinates. Found by hit-testing a grid: what is on top at a point
 * is the browser's to answer, so a panel, a toolbar or anything added later
 * counts without this having to know it exists.
 */
export function largestUncoveredRect(container: HTMLElement): Rect {
  const box = container.getBoundingClientRect();

  const whole = { x: 0, y: 0, width: box.width, height: box.height };

  const cell = Math.max(
    CELL_PX,
    Math.sqrt((box.width * box.height) / MAX_CELLS),
  );

  const cols = Math.floor(box.width / cell);

  const rows = Math.floor(box.height / cell);

  if (cols < 1 || rows < 1) {
    return whole;
  }

  // The grid is centered, so what doesn't divide evenly is split between the
  // edges rather than all left at the far one.
  const ox = (box.width - cols * cell) / 2;

  const oy = (box.height - rows * cell) / 2;

  // Free cells above the current row, per column: the histogram the widest
  // rectangle ending at this row is read off.
  const heights = new Array<number>(cols).fill(0);

  let best = { area: 0, c0: 0, c1: -1, r0: 0, r1: -1 };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = document.elementFromPoint(
        box.left + ox + (c + 0.5) * cell,
        box.top + oy + (r + 0.5) * cell,
      );

      heights[c] = el && container.contains(el) ? heights[c]! + 1 : 0;
    }

    // Each bar is closed by the first shorter one to its right; what it spans
    // by then is the widest rectangle of its own height. The zero sentinel past
    // the last column closes whatever is still open.
    const stack: { c: number; h: number }[] = [];

    for (let c = 0; c <= cols; c++) {
      const h = c === cols ? 0 : heights[c]!;

      let start = c;

      while (stack.length && stack.at(-1)!.h >= h) {
        const bar = stack.pop()!;

        const area = bar.h * (c - bar.c);

        if (area > best.area) {
          best = { area, c0: bar.c, c1: c - 1, r0: r - bar.h + 1, r1: r };
        }

        start = bar.c;
      }

      stack.push({ c: start, h });
    }
  }

  // Nothing free at all — the map is wholly covered, or too small to sample.
  if (best.area === 0) {
    return whole;
  }

  // However narrow the gap turns out to be, it is answered honestly: falling
  // back to the whole map here would tell `ifHidden` that a mark behind a panel
  // is in view, which is the case the caller asked about.
  return {
    x: ox + best.c0 * cell,
    y: oy + best.r0 * cell,
    width: (best.c1 - best.c0 + 1) * cell,
    height: (best.r1 - best.r0 + 1) * cell,
  };
}

/**
 * Moves the map so `at` sits in the middle of the largest part of it that
 * nothing covers — which is rarely the middle of the map, the panel asking for
 * this being over it. With `ifHidden`, a place already well inside that area is
 * left where it is: moving the map under someone who can see what they asked
 * for is the rudest thing this could do. `margin` is how far inside "well
 * inside" means.
 */
export function panToUncovered(
  dispatch: Dispatch,
  at: LatLon,
  options?: Omit<UncoveredOptions, 'keepZoom'>,
): Promise<void> {
  return fitToUncovered(dispatch, [at.lon, at.lat, at.lon, at.lat], {
    ...options,
    keepZoom: true,
  });
}

type UncoveredOptions = {
  ifHidden?: boolean;
  margin?: number;
  /** See `FitOptions.keepZoom`. */
  keepZoom?: boolean;
  /** The zoom not to go past; the map's own unless given, as the store's. */
  maxZoom?: number;
};

/**
 * `panToUncovered` for a [west, south, east, north] extent, zoomed out only as
 * far as it needs to fit the uncovered part and never in.
 */
export async function fitToUncovered(
  dispatch: Dispatch,
  bbox: [number, number, number, number],
  {
    ifHidden = false,
    margin = MARGIN_PX,
    keepZoom,
    maxZoom,
  }: UncoveredOptions = {},
): Promise<void> {
  const map = await mapToFit(bbox);

  if (!map) {
    return;
  }

  const free = largestUncoveredRect(map.getContainer());

  // Never more than a third of what there is, or on a phone the inset would
  // swallow the free area and nothing would ever count as visible.
  const mx = Math.min(margin, free.width / 3);

  const my = Math.min(margin, free.height / 3);

  const nw = map.latLngToContainerPoint([bbox[3], bbox[0]]);

  const se = map.latLngToContainerPoint([bbox[1], bbox[2]]);

  if (
    ifHidden &&
    nw.x > free.x + mx &&
    nw.y > free.y + my &&
    se.x < free.x + free.width - mx &&
    se.y < free.y + free.height - my
  ) {
    return;
  }

  const area = {
    x: free.x + mx,
    y: free.y + my,
    width: free.width - 2 * mx,
    height: free.height - 2 * my,
  };

  // Into the free area less its margins, never zooming in.
  fitLoadedMap(
    map,
    dispatch,
    bbox,
    keepZoom ? { area, keepZoom } : { area, maxZoom: maxZoom ?? map.getZoom() },
  );
}

// The longest a fit waits for its toolbar: a lazy chunk on a slow connection.
const TOOLBAR_WAIT_MS = 1000;

type PendingFit = { run: () => void; timer: ReturnType<typeof setTimeout> };

let pending: PendingFit | undefined;

/**
 * Runs a fit on the next frame, or — where `toolbarComing`, the pick bringing
 * up a selection toolbar that may cover what it places — once that toolbar has
 * mounted, or after a second at the latest. The next call cancels a fit not yet
 * run, so each pick fits once.
 */
export function fitOnceSettled(run: () => void, toolbarComing: boolean): void {
  if (pending) {
    clearTimeout(pending.timer);

    pending = undefined;
  }

  if (!toolbarComing) {
    requestAnimationFrame(run);

    return;
  }

  const waiting: PendingFit = {
    run,
    timer: setTimeout(() => {
      if (pending === waiting) {
        pending = undefined;

        run();
      }
    }, TOOLBAR_WAIT_MS),
  };

  pending = waiting;
}

/** Called by a selection toolbar as it mounts: see `fitOnceSettled`. */
export function selectionToolbarMounted(): void {
  const waiting = pending;

  if (waiting) {
    clearTimeout(waiting.timer);

    pending = undefined;

    requestAnimationFrame(waiting.run);
  }
}
