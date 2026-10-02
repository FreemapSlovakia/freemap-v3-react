import {
  type MapBody,
  OSM_DATA_ATTR,
  OSM_MAP_ATTR,
} from '@shared/mapDefinitions.js';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';

type Bbox = [number, number, number, number];

// Rough extents, enough for a preview to fit to. The order fixes the ids.
const COUNTRIES: Record<string, Bbox> = {
  at: [9.5, 46.4, 17.2, 49.0],
  ba: [15.7, 42.6, 19.6, 45.3],
  be: [2.5, 49.5, 6.4, 51.5],
  bg: [22.4, 41.2, 28.6, 44.2],
  ch: [5.9, 45.8, 10.5, 47.8],
  cy: [32.3, 34.6, 34.6, 35.7],
  cz: [12.1, 48.6, 18.9, 51.1],
  de: [5.9, 47.3, 15.0, 55.1],
  dk: [8.1, 54.6, 12.7, 57.8],
  ee: [21.8, 57.5, 28.2, 59.7],
  es: [-9.3, 36.0, 3.3, 43.8],
  fi: [20.6, 59.8, 31.6, 70.1],
  fr: [-4.8, 42.3, 8.2, 51.1],
  gb: [-8.2, 49.9, 1.8, 58.7],
  gr: [19.4, 34.8, 28.2, 41.7],
  hr: [13.5, 42.4, 19.4, 46.6],
  hu: [16.1, 45.7, 22.9, 48.6],
  ie: [-10.5, 51.4, -6.0, 55.4],
  is: [-24.5, 63.3, -13.5, 66.6],
  it: [6.6, 36.6, 18.5, 47.1],
  li: [9.5, 47.0, 9.6, 47.3],
  lt: [21.0, 53.9, 26.8, 56.5],
  lu: [5.7, 49.4, 6.5, 50.2],
  lv: [21.0, 55.7, 28.2, 58.1],
  me: [18.4, 41.8, 20.4, 43.6],
  mk: [20.4, 40.8, 23.0, 42.4],
  mt: [14.2, 35.8, 14.6, 36.1],
  nl: [3.4, 50.8, 7.2, 53.5],
  no: [4.6, 58.0, 31.1, 71.2],
  pl: [14.1, 49.0, 24.1, 54.8],
  pt: [-9.5, 36.9, -6.2, 42.2],
  ro: [20.3, 43.6, 29.7, 48.3],
  rs: [18.8, 42.2, 23.0, 46.2],
  se: [11.1, 55.3, 24.2, 69.1],
  si: [13.4, 45.4, 16.6, 46.9],
  sk: [16.8, 47.7, 22.6, 49.6],
  ua: [22.1, 44.4, 40.2, 52.4],
  al: [19.3, 39.6, 21.1, 42.7],
  ad: [1.4, 42.4, 1.8, 42.7],
  md: [26.6, 45.5, 30.1, 48.5],
};

const KINDS: [name: string, layer: 'base' | 'overlay', category: string][] = [
  ['Orthophoto', 'base', 'photo'],
  ['Historic orthophoto', 'base', 'historicphoto'],
  ['Topographic map', 'base', 'map'],
  ['Historic military survey', 'base', 'historicmap'],
  ['Cadastre', 'overlay', 'other'],
  ['Land cover', 'overlay', 'other'],
  ['Hillshade', 'overlay', 'elevation'],
  ['Hiking trails', 'overlay', 'map'],
  ['Geological map', 'overlay', 'other'],
  ['Forest map', 'overlay', 'other'],
];

const YEARS = [1960, 1985, 2003, 2010, 2015, 2018, 2021, 2024];

// Every base placeholder draws OpenStreetMap, every overlay OpenRailwayMap.
const BODIES: Record<'base' | 'overlay', MapBody<'tile'>> = {
  base: {
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
  },
  overlay: {
    url: 'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
    maxNativeZoom: 19,
    attribution: [
      {
        type: 'map',
        name: 'OpenRailwayMap',
        url: 'https://www.openrailwaymap.org/',
      },
      OSM_DATA_ATTR,
    ],
  },
};

/** About 3000 placeholder maps; development builds only. */
export function devCatalog(): CatalogMap[] {
  const names = new Intl.DisplayNames(['en'], { type: 'region' });

  const maps: CatalogMap[] = [];

  for (const [country, bbox] of Object.entries(COUNTRIES)) {
    for (const [kind, layer, category] of KINDS) {
      for (const year of YEARS) {
        maps.push({
          type: `Z${maps.length.toString(36).toUpperCase().padStart(4, '0')}`,
          layer,
          name: `${names.of(country.toUpperCase())} ${kind} ${year}`,
          countries: [country],
          bbox,
          category,
          body: BODIES[layer],
        });
      }
    }
  }

  return maps;
}
