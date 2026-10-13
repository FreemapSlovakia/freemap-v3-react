import type { Dispatch } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import { type Map as LeafletMap, type Point, point } from 'leaflet';
import { fitLoadedMap, mapToFit } from './fitMapToBbox.js';
import { getMapLeafletElement } from './hooks/leafletElementHolder.js';
import { mapRefocus } from './model/actions.js';

// Grid the map is probed on: fine enough to find the gaps between the toolbars,
// and no finer than the margins the answer is measured against — the cell size
// is the only resolution the found rectangle's edges have.
const CELL_PX = 48;

// Ceiling on the hit tests one sweep costs, which it pays for on the press path
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
  return (
    findUncoveredRect(container) ?? {
      x: 0,
      y: 0,
      width: container.clientWidth,
      height: container.clientHeight,
    }
  );
}

/** `largestUncoveredRect`, or null for a map wholly covered or too small to sample. */
function findUncoveredRect(container: HTMLElement): Rect | null {
  const box = container.getBoundingClientRect();

  const cell = Math.max(
    CELL_PX,
    Math.sqrt((box.width * box.height) / MAX_CELLS),
  );

  const cols = Math.floor(box.width / cell);

  const rows = Math.floor(box.height / cell);

  if (cols < 1 || rows < 1) {
    return null;
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

  if (best.area === 0) {
    return null;
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

/** `free` shrunk by `margin`, but by no more than a third, or on a phone nothing would count as visible. */
function inset(free: Rect, margin: number): Rect {
  const mx = Math.min(margin, free.width / 3);

  const my = Math.min(margin, free.height / 3);

  return {
    x: free.x + mx,
    y: free.y + my,
    width: free.width - 2 * mx,
    height: free.height - 2 * my,
  };
}

function inside(r: Rect, p: { x: number; y: number }): boolean {
  return p.x > r.x && p.y > r.y && p.x < r.x + r.width && p.y < r.y + r.height;
}

// How often a held place's slide syncs the store and loads tiles, which a hand
// drag does only on release; a `moveend` per pointer move rewrites the URL.
const KEEP_SYNC_MS = 300;

// Private Leaflet members: what `Map.Drag` pans with, and its zoom-animation flag.
type MapInternals = LeafletMap & {
  _rawPanBy(offset: Point): void;
  _animatingZoom: boolean;
};

/** One gesture's state for `keepUncovered`; a fresh one per gesture. */
export type KeepGesture = {
  /** The uncovered area, or null when the map is wholly covered. */
  free?: Rect | null;
  /** Where the place is held on screen, once following has begun. */
  held?: { x: number; y: number };
  /** The glide to `held` is running. */
  gliding?: boolean;
  gpsEnded?: boolean;
  /** Following is over for the rest of the gesture. */
  done?: boolean;
  /** The `moveend` owed to the moves since the last one. */
  sync?: { map: LeafletMap; timer: ReturnType<typeof setTimeout> };
};

/**
 * A hidden place is glided to the middle of the uncovered area and held there
 * while the map slides under it; with `hold`, one in view is held where it is.
 * Call `endKeep` when the gesture ends.
 */
export function keepUncovered(
  dispatch: Dispatch,
  at: LatLon,
  gesture: KeepGesture,
  hold = false,
): void {
  const map = getMapLeafletElement() as MapInternals | undefined;

  // Mid-zoom the container points are off, and the zoom's end resets the pane.
  if (!map?.getContainer().isConnected || map._animatingZoom || gesture.done) {
    return;
  }

  // A drag cuts the glide short; its `moveend` syncs the store to where it stopped.
  if (gesture.gliding) {
    map.stop();

    gesture.gliding = false;
  }

  // Measured once: thousands of hit tests, and panels don't move mid-gesture.
  if (gesture.free === undefined) {
    gesture.free = findUncoveredRect(map.getContainer());
  }

  const { free } = gesture;

  // Nothing of the map to show the place in, as under a full-screen panel.
  if (!free) {
    return;
  }

  // Stopped before measuring, once following: a running pan (GPS following, a
  // fling) would carry the pane past what was measured.
  if (gesture.held && !gesture.sync) {
    map.stop();
  }

  const p = map.latLngToContainerPoint([at.lat, at.lon]);

  if (!gesture.held) {
    if (inside(inset(free, GENEROUS_MARGIN_PX), p)) {
      if (hold) {
        gesture.held = { x: p.x, y: p.y };
      }

      return;
    }

    gesture.held = {
      x: free.x + free.width / 2,
      y: free.y + free.height / 2,
    };

    map.stop();

    const from = map.latLngToContainerPoint([at.lat, at.lon]);

    const { lat, lng } = map.containerPointToLatLng(
      map
        .getSize()
        .divideBy(2)
        .add([from.x - gesture.held.x, from.y - gesture.held.y]),
    );

    gesture.gliding = true;

    gesture.gpsEnded = true;

    map.once('moveend', () => {
      gesture.gliding = false;
    });

    // Through the store, which animates it; told to the map alone, a pending
    // refocus would pull it back.
    dispatch(mapRefocus({ lat, lon: lng, gpsTracked: false }));

    return;
  }

  const dx = p.x - gesture.held.x;

  const dy = p.y - gesture.held.y;

  if (!dx && !dy) {
    return;
  }

  endGpsFollowing(dispatch, gesture);

  // What Leaflet's own drag does: `move` now, `moveend` (the store sync, the
  // tile loads on touch) batched.
  if (!gesture.sync) {
    map.fire('movestart');

    gesture.sync = {
      map,
      timer: setTimeout(() => endKeep(gesture), KEEP_SYNC_MS),
    };
  }

  map._rawPanBy(point(dx, dy));

  map.fire('move');
}

// It would pull the map straight back.
function endGpsFollowing(dispatch: Dispatch, gesture: KeepGesture) {
  if (!gesture.gpsEnded) {
    gesture.gpsEnded = true;

    dispatch(mapRefocus({ gpsTracked: false }));
  }
}

/** Fires the `moveend` a `keepUncovered` gesture still owes. */
export function endKeep(gesture: KeepGesture): void {
  const { sync } = gesture;

  if (sync) {
    clearTimeout(sync.timer);

    gesture.sync = undefined;

    sync.map.fire('moveend');
  }
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

  const inner = inset(free, margin);

  if (
    ifHidden &&
    inside(inner, map.latLngToContainerPoint([bbox[3], bbox[0]])) &&
    inside(inner, map.latLngToContainerPoint([bbox[1], bbox[2]]))
  ) {
    return;
  }

  const size = map.getSize();

  // A sliver of free map would fit an extent only far zoomed out; the whole
  // map, partly covered, serves better.
  const area =
    keepZoom || (free.width >= size.x / 4 && free.height >= size.y / 4)
      ? inner
      : undefined;

  // Never zooming in.
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
 * Runs a fit on the next frame, or once a coming selection or tool toolbar has mounted
 * (a second at most), as it may cover the place. The next call cancels it.
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

/** Called by a selection's or a tool's toolbar as it mounts: see `fitOnceSettled`. */
export function toolbarMounted(): void {
  const waiting = pending;

  if (waiting) {
    clearTimeout(waiting.timer);

    pending = undefined;

    requestAnimationFrame(waiting.run);
  }
}
