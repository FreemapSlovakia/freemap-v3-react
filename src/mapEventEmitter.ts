import { EventEmitter } from 'eventemitter3';

interface EventTypes {
  mouseOver: [number, number];
  mouseOut: [number, number];
  mapClick: [number, number];
  mouseMove: [number, number, MouseEvent];
}

export const mapEventEmitter = new EventEmitter<EventTypes>();
