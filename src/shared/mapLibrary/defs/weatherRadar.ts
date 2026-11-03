import {
  DPC_RADAR_ATTR,
  type MapBody,
  OPERA_ATTR,
} from '@shared/mapDefinitions.js';

const def: MapBody<'radar'> = {
  // The measured feed's ceiling. Each feed's real band comes from its own
  // status document — the forecast is served over a narrower one — so this is
  // only what the registry advertises (offline export, the layer table).
  maxNativeZoom: 9,
  zIndex: 3,
  // Precipitation is read against the map it falls on, so it starts
  // translucent rather than hiding the ground.
  defaultOpacity: 2 / 3,
  attribution: [OPERA_ATTR, DPC_RADAR_ATTR],
};

export default def;
