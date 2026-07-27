import type { Map as LeafletMap } from 'leaflet';
import './touchMouseCompat.js';

type Listener = (map: LeafletMap) => void;

let currentMap: LeafletMap | undefined;

let resolveMap: ((map: LeafletMap) => void) | undefined;

const listeners = new Set<Listener>();

function pending() {
  return new Promise<LeafletMap>((resolve) => {
    resolveMap = resolve;
  });
}

/**
 * Resolves with the currently mounted Leaflet map. The map is recreated when
 * the max-zoom setting changes (`MapContainer` is keyed on it), so await this
 * binding per use instead of caching the map it resolved with.
 */
export let mapPromise = pending();

/**
 * Calls `fn` with the current map and with every map mounted afterwards, for
 * consumers that bind to the instance itself (event handlers). Returns an
 * unsubscribe function.
 */
export function onMap(fn: Listener): () => void {
  listeners.add(fn);

  if (currentMap) {
    fn(currentMap);
  }

  return () => {
    listeners.delete(fn);
  };
}

export function setMapLeafletElement(map: LeafletMap | null): void {
  if (map === currentMap) {
    return;
  }

  currentMap = map ?? undefined;

  if (!map) {
    // detached on unmount; a remount resolves this promise with the new map, so
    // consumers awaiting during the gap don't get the torn-down one
    mapPromise = pending();

    return;
  }

  if (resolveMap) {
    resolveMap(map);

    resolveMap = undefined;
  } else {
    mapPromise = Promise.resolve(map);
  }

  for (const fn of listeners) {
    fn(map);
  }
}
