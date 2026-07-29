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

/**
 * The mounted map, or `undefined` between mounts. For the rare caller that must
 * decide synchronously — a keydown handler can't await {@link mapPromise} and
 * still suppress the browser's own handling of the key.
 */
export function getMapLeafletElement(): LeafletMap | undefined {
  return currentMap;
}

export function setMapLeafletElement(map: LeafletMap | null): void {
  if ((map ?? undefined) === currentMap) {
    return;
  }

  currentMap = map ?? undefined;

  if (!map) {
    // Detached on unmount; arm a fresh promise so consumers awaiting during the
    // gap get the remounted map instead of the torn-down one. An unresolved one
    // is kept — `MapContainer` reports a null ref on its first commit (its
    // context is only set afterwards), and replacing the promise there would
    // strand everything that awaited it before the map first mounted.
    if (!resolveMap) {
      mapPromise = pending();
    }

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
