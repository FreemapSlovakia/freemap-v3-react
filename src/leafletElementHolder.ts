import { Map } from 'leaflet';

let resolve: (map: Map) => void;

export const mapPromise = new Promise<Map>((r) => {
  resolve = r;
});

export function setMapLeafletElement(map: Map | null): void {
  if (map) {
    resolve(map);
  }
}
