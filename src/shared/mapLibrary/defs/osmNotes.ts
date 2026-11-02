import { OSM_NOTES_MIN_ZOOM } from '@features/osmNotes/api.js';
import { type MapBody, OSM_DATA_ATTR } from '@shared/mapDefinitions.js';

const def: MapBody<'osmNotes'> = {
  minZoom: OSM_NOTES_MIN_ZOOM,
  zIndex: 8,
  attribution: [OSM_DATA_ATTR],
};

export default def;
