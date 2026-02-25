import type { Map as LeafletMap } from 'leaflet';
import './touchMouseCompat.js';

let resolve: (map: LeafletMap) => void;

export const mapPromise = new Promise<LeafletMap>((r) => {
  resolve = r;
});

export function setMapLeafletElement(map: LeafletMap | null): void {
  if (map) {
    resolve(map);
  }
}
