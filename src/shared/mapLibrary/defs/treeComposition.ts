import { type MapBody, NLC_ATTR } from '@shared/mapDefinitions.js';

const def: MapBody<'wms'> = {
  url: 'https://gis.nlcsk.org/arcgis/services/Inspire/DrevinoveZlozenie/MapServer/WMSServer',
  layers: ['0'],
  attribution: [NLC_ATTR],
  minZoom: 13,
};

export default def;
