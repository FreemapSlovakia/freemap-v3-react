import { Map } from 'leaflet';

let mapLeafletElement: Map | null = null;

export function setMapLeafletElement(e: Map | null) {
  mapLeafletElement = e;
}

export function getMapLeafletElement(): Map | null {
  return mapLeafletElement;
}
