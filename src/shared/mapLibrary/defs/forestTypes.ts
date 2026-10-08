import { type MapBody, NLC_ATTR } from '@shared/mapDefinitions.js';

const def: MapBody<'wms'> = {
  url: 'https://www.nlcsk.org/mgs/services/Inspire/LesneTypy/MapServer/WMSServer',
  layers: ['LC.LandCoverSurfaces'],
  attribution: [NLC_ATTR],
  minZoom: 12,
};

export default def;
