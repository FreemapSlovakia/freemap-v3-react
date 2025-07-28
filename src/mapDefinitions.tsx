import type { ReactElement } from 'react';
import {
  FaBicycle,
  FaBus,
  FaCamera,
  FaCar,
  FaHiking,
  FaMap,
  FaPencilAlt,
  FaPlane,
  FaSkiingNordic,
  FaStrava,
  FaTractor,
  FaWikipediaW,
} from 'react-icons/fa';
import { GiHills, GiTreasureMap } from 'react-icons/gi';
import { SiOpenstreetmap } from 'react-icons/si';
import black1x1 from './images/1x1-black.png';
import transparent1x1 from './images/1x1-transparent.png';
import white1x1 from './images/1x1-white.png';

export interface AttributionDef {
  type: 'map' | 'data' | 'photos';
  name?: string;
  nameKey?:
    | 'osmData'
    | 'freemap'
    | 'srtm'
    | 'maptiler'
    | 'outdoorShadingAttribution';
  url?: string;
}

const OSM_MAP_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0OpenStreetMap',
  url: 'https://osm.org/',
};

const OSM_DATA_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'osmData',
  url: 'https://osm.org/copyright',
};

const FM_ATTR: AttributionDef = {
  type: 'map',
  nameKey: 'freemap',
};

const SRTM_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'srtm',
};

const STRAVA_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0Strava',
  url: 'https://www.strava.com/',
};

const NLC_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0NLC Zvolen',
  url: 'http://www.nlcsk.org/',
};

const LLS_URL = 'https://www.geoportal.sk/sk/udaje/lls-dmr/';

export const defaultMenuLayerLetters = [
  'T',
  'C',
  'S',
  'Z',
  'O',
  'X',
  'I',
  'l',
  's0',
  's1',
  's2',
  's3',
  's4',
  'w',
];

export const defaultToolbarLayerLetters = ['X', 'O', 'Z', 'I'];

export const baseLayerLetters = [
  'A',
  'T',
  'C',
  'K',
  'S',
  'Z',
  'J',
  'O',
  'M',
  'd',
  'X',
  '4',
  '5',
  '6',
  '7',
  '8',
  'VO',
  'VS',
  'VD',
  'VT',
  // 'H',
] as const;

export const overlayLetters = [
  'i',
  'I',
  'l',
  't',
  'c',
  's0',
  's1',
  's2',
  's3',
  's4',
  'w',
  'h',
  'z',
] as const;

export type Num1digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CustomBaseLayerLetters = `.${Num1digit}`;

export type CustomOverlayLayerLetters = `:${Num1digit}`;

export type CustomLayerLetters =
  | CustomBaseLayerLetters
  | CustomOverlayLayerLetters;

export type IntegratedBaseLayerLetters = (typeof baseLayerLetters)[number];

export type IntegratedOverlayLayerLetters = (typeof overlayLetters)[number];

export type IntegratedLayerLetters =
  | IntegratedBaseLayerLetters
  | IntegratedOverlayLayerLetters;

export type BaseLayerLetters =
  | IntegratedBaseLayerLetters
  | CustomBaseLayerLetters;

export type OverlayLetters =
  | IntegratedOverlayLayerLetters
  | CustomOverlayLayerLetters;

export type HasUrl = {
  url: string;
};

export type HasMaxNativeZoom = {
  maxNativeZoom?: number;
};

type HasZIndex = {
  zIndex?: number;
};

export type IsIntegratedLayerDef = {
  adminOnly?: boolean;
  icon: ReactElement;
  key?: [code: string, shift: boolean];
  premiumFromZoom?: number;
  experimental?: boolean;
  attribution: AttributionDef[];
  coutries?: string[];
};

export type HasScaleWithDpi = {
  scaleWithDpi?: boolean;
};

export type IsCommonLayerDef = {
  minZoom?: number;
};

type IsParametricShadingLayerDef = HasUrl &
  HasMaxNativeZoom &
  HasZIndex &
  HasScaleWithDpi & {
    technology: 'parametricShading';
  };

type IsGalleryLayerDef = HasZIndex & {
  technology: 'gallery';
};

type IsWikipediaLayerDef = HasZIndex & {
  technology: 'wikipedia';
};

type IsInteractiveLayerDef = {
  technology: 'interactive';
};

type IsMapLibreLayerDef = HasUrl & {
  technology: 'maplibre';
};

export type IsTileLayerDef = HasUrl &
  HasMaxNativeZoom &
  HasZIndex &
  HasScaleWithDpi & {
    subdomains?: string | string[];
    tms?: boolean;
    extraScales?: number[];
    errorTileUrl?: string;
    cors?: boolean;
  };

export type IsIntegratedBaseLayerDef = {
  type: IntegratedBaseLayerLetters;
  layer: 'base';
};

export type IsCustomBaseLayerDef = {
  type: CustomBaseLayerLetters;
};

export type IsIntegratedOverlayLayerDef = {
  type: IntegratedOverlayLayerLetters;
  layer: 'overlay';
};

export type IsCustomOverlayLayerDef = {
  type: CustomOverlayLayerLetters;
};

export type IsAllTechnologiesLayerDef =
  | (IsTileLayerDef & {
      creditsPerMTile?: number;
      technology: 'tile';
    })
  | IsMapLibreLayerDef
  | IsParametricShadingLayerDef
  | IsGalleryLayerDef
  | IsInteractiveLayerDef
  | IsWikipediaLayerDef;

export type CustomBaseLayerDef = IsTileLayerDef &
  IsCustomBaseLayerDef &
  IsCommonLayerDef;

export type CustomOverlayLayerDef = IsTileLayerDef &
  IsCustomOverlayLayerDef &
  IsCommonLayerDef;

export type CustomLayerDef = CustomBaseLayerDef | CustomOverlayLayerDef;

export type IntegratedBaseLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = T & IsCommonLayerDef & IsIntegratedLayerDef & IsIntegratedBaseLayerDef;

export type IntegratedOverlayLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = T & IsCommonLayerDef & IsIntegratedLayerDef & IsIntegratedOverlayLayerDef;

export type IntegratedLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = IntegratedBaseLayerDef<T> | IntegratedOverlayLayerDef<T>;

export type BaseLayerDef = IntegratedBaseLayerDef | CustomBaseLayerDef;

export type OverlayLayerDef = IntegratedOverlayLayerDef | CustomOverlayLayerDef;

export type LayerDef = CustomLayerDef | IntegratedLayerDef;

function legacyFreemap(
  type: IntegratedBaseLayerLetters,
  icon: ReactElement,
): IntegratedBaseLayerDef {
  return {
    technology: 'tile',
    layer: 'base',
    type,
    icon,
    url: `//tile.freemap.sk/${type}/{z}/{x}/{y}.jpeg`,
    attribution: [FM_ATTR, OSM_DATA_ATTR, ...(type === 'A' ? [] : [SRTM_ATTR])],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['Key' + type, false],
    creditsPerMTile: 1000,
    coutries: ['sk'],
  };
}

export const baseLayers: IntegratedBaseLayerDef[] = [
  {
    layer: 'base',
    type: 'X',
    technology: 'tile',
    icon: <GiTreasureMap />,
    url: `${process.env['FM_MAPSERVER_URL']}/{z}/{x}/{y}`,
    extraScales: [2, 3],
    attribution: [
      FM_ATTR,
      OSM_DATA_ATTR,
      {
        type: 'data',
        nameKey: 'outdoorShadingAttribution',
        url: '?document=outdoorShadingAttribution',
      },
    ],
    minZoom: 6,
    maxNativeZoom: 19,
    key: ['KeyX', false],
    premiumFromZoom: 19,
    creditsPerMTile: 5000,
    coutries: [
      'al',
      'at',
      'ba',
      'be', // partial
      'bg',
      'ch',
      'cs',
      'de', // partial
      'fr',
      'gr', // small part
      'hr',
      'hu',
      'it',
      'lu',
      'me',
      'mk',
      'nl', // small part
      'pl', // partial
      'ro',
      'rs',
      'si',
      'sk',
      'sm',
      'tr', // small part
      'ua', // small part
      'va',
      'xk',
    ],
  },
  legacyFreemap('A', <FaCar />),
  legacyFreemap('T', <FaHiking />),
  legacyFreemap('C', <FaBicycle />),
  legacyFreemap('K', <FaSkiingNordic />),
  {
    layer: 'base',
    type: 'O',
    technology: 'tile',
    icon: <SiOpenstreetmap />,
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    key: ['KeyO', false],
  },
  {
    layer: 'base',
    type: 'S',
    technology: 'tile',
    url: 'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server', 'services'],
    icon: <FaPlane />,
    minZoom: 0,
    maxNativeZoom: 19,
    scaleWithDpi: true,
    key: ['KeyS', false],
    attribution: [
      {
        type: 'map',
        name: '©\xa0Esri', // TODO others, see https://github.com/esri/esri-leaflet#terms
        url: 'https://www.esri.com/',
      },
    ],
  },
  {
    layer: 'base',
    type: 'Z',
    technology: 'tile',
    url: 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 20,
    scaleWithDpi: true,
    icon: <FaPlane />,
    attribution: [
      {
        type: 'map',
        name: '©\xa0GKÚ, NLC',
        url: 'https://www.geoportal.sk/sk/udaje/ortofotomozaika/',
      },
      {
        type: 'map',
        name: '©\xa0ČÚZK',
        url: 'https://geoportal.cuzk.cz/',
      },
    ],
    key: ['KeyZ', false],
    errorTileUrl: white1x1,
    premiumFromZoom: 20,
    creditsPerMTile: 1000,
    coutries: ['sk', 'cz'],
  },
  {
    layer: 'base',
    type: 'J',
    technology: 'tile',
    url: 'https://ofmozaika1c.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 19,
    scaleWithDpi: true,
    icon: <FaPlane />,
    attribution: [
      {
        type: 'map',
        name: '©\xa0GKÚ, NLC',
        url: 'https://www.geoportal.sk/sk/udaje/ortofotomozaika/',
      },
    ],
    key: ['KeyZ', true],
    errorTileUrl: white1x1,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  {
    layer: 'base',
    type: 'M',
    technology: 'tile',
    url: 'https://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
    minZoom: 3,
    maxNativeZoom: 18,
    icon: <FaBicycle />,
    attribution: [
      {
        type: 'map',
        name: '©\xa0Martin Tesař',
        url: 'mailto:smmtb@gmail.com',
      },
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
    key: ['KeyQ', false],
  },
  {
    layer: 'base',
    type: 'd',
    technology: 'tile',
    url: '//tile.memomaps.de/tilegen/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <FaBus />,
    cors: false,
    attribution: [
      {
        type: 'map',
        name: '©\xa0MeMoMaps',
        url: 'https://memomaps.de/en/',
      },
      OSM_DATA_ATTR,
    ],
    key: ['KeyQ', false],
  },
  {
    layer: 'base',
    type: '4',
    technology: 'tile',
    url: 'https://dmr5-light-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'DMR 5.0: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    key: ['KeyD', true],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  {
    layer: 'base',
    type: '7',
    technology: 'tile',
    url: 'https://sk-hires-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 20,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'LLS DMR: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    key: ['KeyH', false],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    premiumFromZoom: 17,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  {
    layer: 'base',
    type: '8',
    technology: 'tile',
    url: 'https://cz-hires-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: '©\xa0ČÚZK',
        url: 'https://geoportal.cuzk.cz/',
      },
    ],
    key: ['KeyL', false],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    premiumFromZoom: 16,
    coutries: ['cz'],
  },
  {
    layer: 'base',
    type: '5',
    technology: 'tile',
    url: 'https://dmr5-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'DMR 5.0: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    key: ['KeyD', false],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  {
    layer: 'base',
    type: '6',
    technology: 'tile',
    url: 'https://dmp1-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'DMP 1.0: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    key: ['KeyF', false],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  {
    layer: 'base',
    type: 'VO',
    technology: 'maplibre',
    url: maptiler('openstreetmap'),
    key: ['KeyV', false],
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'VS',
    technology: 'maplibre',
    url: maptiler('streets-v2'),
    key: ['KeyR', false],
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'VD',
    technology: 'maplibre',
    url: maptiler('dataviz-dark'),
    key: ['KeyM', false],
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'VT',
    technology: 'maplibre',
    url: maptiler('outdoor-v2'),
    key: ['KeyU', false],
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
];

export const overlayLayers: IntegratedOverlayLayerDef[] = [
  {
    layer: 'overlay',
    type: 'i',
    technology: 'interactive',
    icon: <FaPencilAlt />,
    key: ['KeyI', true],
    attribution: [],
  },
  {
    layer: 'overlay',
    type: 'I',
    technology: 'gallery',
    icon: <FaCamera />,
    minZoom: 0,
    key: ['KeyF', true],
    zIndex: 4,
    attribution: [
      {
        type: 'photos',
        name: 'CC BY-SA 4.0',
      },
    ],
  },
  {
    layer: 'overlay',
    type: 'w',
    technology: 'wikipedia',
    icon: <FaWikipediaW />,
    minZoom: 8,
    key: ['KeyW', true],
    zIndex: 4,
    attribution: [],
  },
  {
    layer: 'overlay',
    type: 'h',
    technology: 'parametricShading',
    // url: 'https://parametric-shading.tiles.freemap.sk/{z}/{x}/{y}',
    url: 'https://www.freemap.sk/tiles/parametric-shading/sk/{z}/{x}/{y}',
    // url: 'http://localhost:3033/tiles/{z}/{x}/{y}',
    icon: <GiHills />,
    key: ['KeyJ', true],
    scaleWithDpi: true,
    maxNativeZoom: 19,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'LLS DMR: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    experimental: true,
    premiumFromZoom: 13,
    zIndex: 2,
    coutries: ['sk'],
  },
  {
    layer: 'overlay',
    type: 'z',
    technology: 'parametricShading',
    url: 'https://www.freemap.sk/tiles/parametric-shading/cz/{z}/{x}/{y}',
    icon: <GiHills />,
    key: ['KeyK', true],
    scaleWithDpi: true,
    maxNativeZoom: 18,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'LLS DMR: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    experimental: true,
    premiumFromZoom: 13,
    zIndex: 2,
    coutries: ['cz'],
  },
  {
    layer: 'overlay',
    type: 'l',
    technology: 'tile',
    icon: <FaTractor />,
    url: 'https://nlc.tiles.freemap.sk/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    key: ['KeyN', true],
    zIndex: 3,
    errorTileUrl: transparent1x1,
    // adminOnly: true,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  ...(
    [
      ['s0', 'all'],
      ['s1', 'ride'],
      ['s2', 'run'],
      ['s3', 'water'],
      ['s4', 'winter'],
    ] as const
  ).map(
    ([type, stravaType]) =>
      ({
        layer: 'overlay' as const,
        type,
        technology: 'tile' as const,
        icon: <FaStrava />,
        url: `//strava-heatmap.tiles.freemap.sk/${stravaType}/purple/{z}/{x}/{y}.png`,
        attribution: [STRAVA_ATTR],
        minZoom: 0,
        maxNativeZoom: 15, // for @2x.png is max 14, otherwise 15; also @2x.png tiles are 1024x1024 and "normal" are 512x512 so no need to use @2x
        key: (stravaType === 'all' ? ['KeyH', true] : undefined) as
          | [string, boolean]
          | undefined,
        zIndex: 3,
        errorTileUrl: transparent1x1,
        premiumFromZoom: 13,
      }) satisfies IntegratedOverlayLayerDef,
  ),
  {
    layer: 'overlay',
    type: 't',
    technology: 'tile',
    icon: <FaHiking />,
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    zIndex: 3,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
  {
    layer: 'overlay',
    type: 'c',
    technology: 'tile',
    icon: <FaBicycle />,
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    zIndex: 3,
    creditsPerMTile: 1000,
    coutries: ['sk'],
  },
];

function maptiler(style: string) {
  return `https://api.maptiler.com/maps/${style}/style.json?key=KgKDGG75zYDIyCCTAG6L`;
}
