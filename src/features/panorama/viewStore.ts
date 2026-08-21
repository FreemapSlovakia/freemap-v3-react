import { useSyncExternalStore } from 'react';

/** Which way the viewer is looking, and how much of the horizon it holds. */
export interface PanoramaView {
  /** Bearing at the middle of the picture, degrees clockwise from north. */
  azimuth: number;
  /** Degrees of horizon on screen, which narrows as the view zooms in. */
  fov: number;
}

/**
 * The live view, kept outside the store because it changes with every frame of
 * a drag: the bearing only reaches Redux when a gesture settles, since every
 * dispatch rewrites the URL. The map's wedge has to follow the picture as it
 * turns, so it reads from here instead.
 */
let view: PanoramaView | null = null;

const listeners = new Set<() => void>();

/** Half a degree, which no eye follows but every frame would otherwise report. */
const EPSILON = 0.5;

export function setPanoramaView(next: PanoramaView | null): void {
  if (
    view === next ||
    (view &&
      next &&
      Math.abs(view.azimuth - next.azimuth) < EPSILON &&
      Math.abs(view.fov - next.fov) < EPSILON)
  ) {
    return;
  }

  view = next;

  for (const listener of listeners) {
    listener();
  }
}

/**
 * Where the pointer is resting on the terrain, so the map can follow it. Its
 * own slot rather than a field of the view: it changes on a different gesture
 * and would otherwise churn the wedge with every mouse move.
 */
let hover: { lat: number; lon: number } | null = null;

export function setPanoramaHover(next: { lat: number; lon: number } | null) {
  if (
    hover === next ||
    (hover && next && hover.lat === next.lat && hover.lon === next.lon)
  ) {
    return;
  }

  hover = next;

  for (const listener of listeners) {
    listener();
  }
}

export function usePanoramaHover(): { lat: number; lon: number } | null {
  return useSyncExternalStore(
    subscribe,
    () => hover,
    () => hover,
  );
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PanoramaView | null {
  return view;
}

export function usePanoramaView(): PanoramaView | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
