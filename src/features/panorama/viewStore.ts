import type { LatLon } from '@shared/types/common.js';
import { useSyncExternalStore } from 'react';

/**
 * One thing the map and the picture pass between them frame by frame, kept
 * outside Redux: every dispatch writes the persisted state and rewrites the
 * URL, which is not a thing to do sixty times a second. Each slot keeps its own
 * listeners, so the gesture setting one does not wake the readers of the rest,
 * and its own idea of what counts as the same value.
 */
function makeSlot<T>(same: (a: T, b: T) => boolean) {
  let value: T | null = null;

  const listeners = new Set<() => void>();

  const read = () => value;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    set(next: T | null): void {
      if (value === next || (value && next && same(value, next))) {
        return;
      }

      value = next;

      for (const listener of listeners) {
        listener();
      }
    },

    useValue(): T | null {
      return useSyncExternalStore(subscribe, read, read);
    },
  };
}

/** Which way the viewer is looking, and how much of the horizon it holds. */
export interface PanoramaView {
  /** Bearing at the middle of the picture, degrees clockwise from north. */
  azimuth: number;
  /** Degrees of horizon on screen, which narrows as the view zooms in. */
  fov: number;
}

/** Half a degree, which no eye follows but every frame would otherwise report. */
const EPSILON = 0.5;

/**
 * The live view, which changes with every frame of a drag: the bearing only
 * reaches Redux when a gesture settles. The map's wedge has to follow the
 * picture as it turns, so it reads from here instead.
 */
const viewSlot = makeSlot<PanoramaView>(
  (a, b) =>
    Math.abs(a.azimuth - b.azimuth) < EPSILON &&
    Math.abs(a.fov - b.fov) < EPSILON,
);

export const setPanoramaView = viewSlot.set;

export const usePanoramaView = viewSlot.useValue;

/**
 * Where the pointer is resting on the terrain, so the map can follow it. Its
 * own slot rather than a field of the view: it changes on a different gesture
 * and would otherwise churn the wedge with every mouse move.
 */
const hoverSlot = makeSlot<LatLon>(
  (a, b) => a.lat === b.lat && a.lon === b.lon,
);

export const setPanoramaHover = hoverSlot.set;

export const usePanoramaHover = hoverSlot.useValue;

/** Where the map is aiming the viewer, while a gesture there is doing it. */
export interface PanoramaAim {
  azimuth: number;
  /**
   * The place the gesture holds, where it holds one — dragging the mark does,
   * swinging the wedge names only a bearing. `seen` is what the picture makes
   * of it, `null` where it cannot see it at all: the figures are true of the
   * map either way, but a dot on the terrain would claim a view of ground
   * behind a ridge. Carried rather than looked up again — the gesture has just
   * read it, and the picture would only walk the same column a second time.
   */
  mark: {
    at: LatLon;
    distance: number;
    seen: { iy: number; ele: number } | null;
  } | null;
}

const aimSlot = makeSlot<PanoramaAim>(
  (a, b) =>
    a.azimuth === b.azimuth &&
    a.mark?.distance === b.mark?.distance &&
    a.mark?.seen?.iy === b.mark?.seen?.iy &&
    a.mark?.seen?.ele === b.mark?.seen?.ele &&
    a.mark?.at.lat === b.mark?.at.lat &&
    a.mark?.at.lon === b.mark?.at.lon,
);

export const setPanoramaAim = aimSlot.set;

export const usePanoramaAim = aimSlot.useValue;
