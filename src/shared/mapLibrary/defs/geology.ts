import { GEOLOGY_ATTR, type MapBody } from '@shared/mapDefinitions.js';

const def: MapBody<'wms'> = {
  url: 'https://ags.geology.sk/arcgis/services/WebServices/GM50/MapServer/WMSServer',
  layers: ['0', '1', '2'],
  attribution: [GEOLOGY_ATTR],
  premiumFromZoom: 15,
};

export default def;
