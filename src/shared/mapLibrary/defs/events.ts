import type { MapBody } from '@shared/mapDefinitions.js';

const def: MapBody<'events'> = {
  // Below it the markers hide (EventsLayer), and the layer shows the zoom warning.
  minZoom: 8,
  zIndex: 8,
  attribution: [],
};

export default def;
