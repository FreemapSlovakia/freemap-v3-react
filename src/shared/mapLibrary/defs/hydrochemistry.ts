import { GEOLOGY_ATTR, type MapBody } from '@shared/mapDefinitions.js';

const def: MapBody<'wms'> = {
  url: 'https://ags.geology.sk/arcgis/services/WebServices/HGCH50/MapServer/WMSServer',
  layers: ['1', '2', '3', '4'],
  attribution: [GEOLOGY_ATTR],
  premiumFromZoom: 15,
};

export default def;
