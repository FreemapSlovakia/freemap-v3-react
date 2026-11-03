import {
  type MapBody,
  OSM_DATA_ATTR,
  OSM_MAP_ATTR,
} from '@shared/mapDefinitions.js';

const def: MapBody<'tile'> = {
  url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  minZoom: 0,
  maxNativeZoom: 19,
  attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
};

export default def;
