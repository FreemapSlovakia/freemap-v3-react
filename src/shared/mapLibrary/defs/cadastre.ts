import { GKU_ATTR, type MapBody } from '@shared/mapDefinitions.js';

const def: MapBody<'wms'> = {
  url: 'https://kataster.skgeodesy.sk/eskn/services/NR/kn_wms_norm/MapServer/WMSServer',
  layers: [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
  ],
  attribution: [GKU_ATTR],
  premiumFromZoom: 15,
};

export default def;
