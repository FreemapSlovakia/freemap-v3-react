import transparent1x1 from './images/1x1-transparent.png';
import white1x1 from './images/1x1-white.png';

export interface AttributionDef {
  type: 'map' | 'data' | 'photos';
  name?: string;
  nameKey?: 'osmData' | 'freemap' | 'srtm';
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

export const baseLayerLetters = [
  'A',
  'T',
  'C',
  'K',
  'S',
  'Z',
  'O',
  'M',
  'p',
  'd',
  'h',
  'X',
] as const;

export const overlayLetters = [
  'i',
  'I',
  'l',
  'n1',
  'n2',
  'n3',
  'g',
  't',
  'c',
  'q',
  'r',
  's0',
  's1',
  's2',
  's3',
  's4',
  'w',
  'e',
] as const;

export type BaseLayerLetters = typeof baseLayerLetters[number];

export type OverlayLetters = typeof overlayLetters[number];

export interface LayerDef {
  icon: string;
  url?: string;
  attribution: AttributionDef[];
  minZoom?: number;
  minNativeZoom?: number;
  maxNativeZoom?: number;
  showOnlyInExpertMode?: boolean;
  adminOnly?: boolean;
  zIndex?: number; // TODO only overlays
  subdomains?: string | string[];
  strava?: boolean;
  tms?: boolean;
  extraScales?: number[];
  primary?: true | string;
  errorTileUrl?: string;
  tileSize?: number;
  zoomOffset?: number;
}

export interface BaseLayerDef extends LayerDef {
  type: BaseLayerLetters;
  key: [code: string, shift: boolean];
}

export interface OverlayLayerDef extends LayerDef {
  type: OverlayLetters;
  key?: [code: string, shift: boolean];
}

const isHdpi = (window.devicePixelRatio || 1) > 1.4;

function legacyFreemap(
  type: BaseLayerLetters,
  icon: string,
  showOnlyInExpertMode: boolean,
): BaseLayerDef {
  return {
    type,
    icon,
    url: `//tile.freemap.sk/${type}/{z}/{x}/{y}.jpeg`,
    attribution: [FM_ATTR, OSM_DATA_ATTR, ...(type === 'A' ? [] : [SRTM_ATTR])],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['Key' + type, false],
    showOnlyInExpertMode,
  };
}

export const baseLayers: BaseLayerDef[] = [
  {
    type: 'X',
    icon: 'tree',
    url: `${
      process.env.FM_MAPSERVER_URL || 'https://outdoor.tiles.freemap.sk'
    }/{z}/{x}/{y}`,
    extraScales: [2, 3],
    attribution: [FM_ATTR, OSM_DATA_ATTR, SRTM_ATTR],
    minZoom: 6,
    maxNativeZoom: 19,
    key: ['KeyX', false],
    primary: true,
  },
  legacyFreemap('A', 'car', true),
  legacyFreemap('T', '!icon-hiking', false),
  legacyFreemap('C', 'bicycle', false),
  legacyFreemap('K', '!icon-skier-skiing', true),
  {
    type: 'O',
    icon: 'globe',
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    key: ['KeyO', false],
    primary: true,
  },
  {
    type: 'S',
    url:
      'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server', 'services'],
    icon: 'plane',
    minZoom: 0,
    maxNativeZoom: isHdpi ? 18 : 19,
    tileSize: isHdpi ? 128 : 256,
    zoomOffset: isHdpi ? 1 : 0,
    key: ['KeyS', false],
    attribution: [
      {
        type: 'map',
        name: '©\xa0Esri', // TODO others, see https://github.com/esri/esri-leaflet#terms
        url: 'https://www.esri.com/',
      },
    ],
    primary: '!sk',
  },
  {
    type: 'Z',
    url: 'https://ofmozaika.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minNativeZoom: 0,
    maxNativeZoom: isHdpi ? 18 : 19,
    icon: 'plane',
    attribution: [
      {
        type: 'map',
        name: '©\xa0GKÚ, NLC',
        url: 'https://www.geoportal.sk/sk/udaje/ortofotomozaika/',
      },
    ],
    key: ['KeyZ', false],
    primary: 'sk',
    errorTileUrl: white1x1,
    tileSize: isHdpi ? 128 : 256,
    zoomOffset: isHdpi ? 1 : 0,
  },
  {
    type: 'M',
    url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
    minZoom: 3,
    maxNativeZoom: 18,
    icon: 'bicycle',
    showOnlyInExpertMode: true,
    attribution: [
      {
        type: 'map',
        name: '©\xa0Martin Tesař',
        url: 'mailto:smmtb@gmail.com',
      },
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
    key: ['KeyM', false],
  },
  {
    type: 'p',
    url: '//tile.opentopomap.org/{z}/{x}/{y}.png',
    minZoom: 3,
    maxNativeZoom: 17,
    icon: 'tree',
    showOnlyInExpertMode: true,
    attribution: [
      {
        type: 'map',
        name: '©\xa0OpenTopoMap',
        url: 'https://tile.opentopomap.org/about#verwendung',
      },
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
    key: ['KeyP', false],
  },
  {
    type: 'd',
    url: '//tile.memomaps.de/tilegen/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: 'bus',
    showOnlyInExpertMode: true,
    attribution: [
      {
        type: 'map',
        name: '©\xa0MeMoMaps',
        url: 'https://memomaps.de/en/',
      },
      OSM_DATA_ATTR,
    ],
    key: ['KeyD', false],
  },
  {
    type: 'h',
    url: '//tms.freemap.sk/historicke/{z}/{x}/{y}.png',
    minNativeZoom: 8,
    maxNativeZoom: 12,
    icon: 'institution',
    showOnlyInExpertMode: true,
    attribution: [],
    key: ['KeyH', false],
  },
];

export const overlayLayers: OverlayLayerDef[] = [
  {
    type: 'i',
    icon: 'pencil',
    key: ['KeyI', true],
    attribution: [],
    showOnlyInExpertMode: true,
  },
  {
    type: 'I',
    icon: 'picture-o',
    minZoom: 0,
    key: ['KeyF', true],
    zIndex: 4,
    attribution: [
      {
        type: 'photos',
        name: 'CC-BY-SA',
      },
    ],
    primary: true,
  },
  {
    type: 'w',
    icon: 'wikipedia-w',
    minZoom: 12,
    key: ['KeyW', true],
    zIndex: 4,
    attribution: [],
  },
  {
    type: 'l',
    icon: 'tree',
    url: 'https://nlc.tiles.freemap.sk/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    key: ['KeyN', true],
    zIndex: 3,
    errorTileUrl: transparent1x1,
    // adminOnly: true,
  },
  ...([
    ['s0', 'both'],
    ['s1', 'ride'],
    ['s2', 'run'],
    ['s3', 'water'],
    ['s4', 'winter'],
  ] as const).map(([type, stravaType]) => ({
    type,
    icon: 'scribd', // TODO use correct logo
    url: `//strava-heatmap.tiles.freemap.sk/${stravaType}/bluered/{z}/{x}/{y}.png?px=${
      isHdpi ? 512 : 256
    }`,
    attribution: [STRAVA_ATTR],
    minZoom: 0,
    maxNativeZoom: isHdpi ? 15 : 16,
    key: (stravaType === 'both' ? ['KeyH', true] : undefined) as
      | [string, boolean]
      | undefined,
    showOnlyInExpertMode: stravaType !== 'both',
    zIndex: 3,
    strava: true,
    errorTileUrl: transparent1x1,
  })),
  {
    type: 'g',
    icon: '!icon-gps-device',
    url: '//gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    minZoom: 0,
    maxNativeZoom: 20,
    key: ['KeyG', true],
    showOnlyInExpertMode: true,
    zIndex: 3,
  },
  {
    type: 't',
    icon: '!icon-hiking',
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['KeyT', true],
    showOnlyInExpertMode: true,
    zIndex: 3,
  },
  {
    type: 'c',
    icon: 'bicycle',
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['KeyC', true],
    showOnlyInExpertMode: true,
    zIndex: 3,
  },
  {
    type: 'q',
    icon: 'snowflake-o',
    url: '//www.opensnowmap.org/pistes/{z}/{x}/{y}.png',
    attribution: [
      {
        type: 'map',
        name: '©\xa0OpenSnowMap.org',
      },
      OSM_DATA_ATTR,
    ],
    minZoom: 0,
    maxNativeZoom: 18,
    key: ['KeyS', true],
    showOnlyInExpertMode: true,
    zIndex: 3,
  },
  ...([
    ['n1', ['Digit1', false], ''],
    ['n2', ['Digit2', false], 'h'],
    ['n3', ['Digit3', false], 'c'],
  ] as const).map(([type, key, suffix]) => ({
    type,
    icon: 'font',
    url: `//tiles.freemap.sk/names${suffix}/{z}/{x}/{y}.png`,
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: key as [string, boolean] | undefined,
    showOnlyInExpertMode: true,
    zIndex: 3,
  })),
  {
    type: 'e',
    icon: 'rss',
    url: '//dmr5.tiles.freemap.sk/{z}/{x}/{y}.png',
    minZoom: 8,
    maxNativeZoom: isHdpi ? 16 : 17,
    key: ['KeyE', true],
    showOnlyInExpertMode: true,
    zIndex: 2,
    attribution: [
      {
        type: 'data',
        url: 'https://www.geoportal.sk/sk/udaje/lls-dmr/',
        name: '©\xa0Úrad geodézie, kartografie a katastra SR',
      },
    ],
    tileSize: isHdpi ? 128 : 256,
    zoomOffset: isHdpi ? 1 : 0,
  },
  {
    type: 'r',
    icon: 'pencil-square-o',
    url: '//dev.freemap.sk/layers/renderedby/?/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 12,
    key: ['KeyR', true],
    showOnlyInExpertMode: true,
    zIndex: 5,
    attribution: [FM_ATTR],
  },
];
