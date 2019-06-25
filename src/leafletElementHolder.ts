import { Evented } from 'leaflet';

let mapLeafletElement: Evented | null = null;

export function setMapLeafletElement(e: Evented | null) {
  mapLeafletElement = e;
}

export function getMapLeafletElement(): Evented | null {
  return mapLeafletElement;
}
