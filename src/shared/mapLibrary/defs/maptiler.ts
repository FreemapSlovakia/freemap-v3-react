import { type MapBody, OSM_DATA_ATTR } from '@shared/mapDefinitions.js';

/** A MapTiler vector style. */
export function maptilerStyle(style: string): MapBody<'maplibre'> {
  return {
    url: `https://api.maptiler.com/maps/${style}/style.json?key=KgKDGG75zYDIyCCTAG6L`,
    attribution: [OSM_DATA_ATTR, { type: 'map', nameKey: 'maptiler' }],
  };
}
