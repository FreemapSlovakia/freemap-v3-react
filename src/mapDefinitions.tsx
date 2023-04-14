import { ReactElement } from 'react';
import { AiFillBank } from 'react-icons/ai';
import { BsPencilSquare } from 'react-icons/bs';
import {
  FaBicycle,
  FaBus,
  FaCamera,
  FaCar,
  FaFont,
  FaHiking,
  FaMap,
  FaPencilAlt,
  FaPlane,
  FaSkiingNordic,
  FaSnowflake,
  FaStrava,
  FaTractor,
  FaTree,
  FaWikipediaW,
} from 'react-icons/fa';
import { GiHills, GiPathDistance, GiTreasureMap } from 'react-icons/gi';
import { SiOpenstreetmap } from 'react-icons/si';
import black1x1 from './images/1x1-black.png';
import transparent1x1 from './images/1x1-transparent.png';
import white1x1 from './images/1x1-white.png';

export interface AttributionDef {
  type: 'map' | 'data' | 'photos';
  name?: string;
  nameKey?: 'osmData' | 'freemap' | 'srtm' | 'maptiler';
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
  'O',
  'M',
  'p',
  'd',
  'h',
  'X',
  '4',
  '5',
  'VO',
  'VS',
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
] as const;

export type Num1digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type NoncustomLayerLetters =
  | typeof baseLayerLetters[number]
  | typeof overlayLetters[number];

export type BaseLayerLetters =
  | typeof baseLayerLetters[number]
  | `.${Num1digit}`;

export type OverlayLetters = typeof overlayLetters[number] | `:${Num1digit}`;

export interface LayerDef {
  icon: ReactElement;
  url?: string;
  attribution: AttributionDef[];
  minZoom?: number;
  maxNativeZoom?: number;
  adminOnly?: boolean;
  zIndex?: number; // TODO only overlays
  subdomains?: string | string[];
  tms?: boolean;
  extraScales?: number[];
  errorTileUrl?: string;
  scaleWithDpi?: boolean;
  cors?: boolean;
}

export interface BaseLayerDef extends LayerDef {
  type: BaseLayerLetters;
  key: [code: string, shift: boolean];
}

export interface OverlayLayerDef extends LayerDef {
  type: OverlayLetters;
  key?: [code: string, shift: boolean];
}

function legacyFreemap(
  type: BaseLayerLetters,
  icon: ReactElement,
): BaseLayerDef {
  return {
    type,
    icon,
    url: `//tile.freemap.sk/${type}/{z}/{x}/{y}.jpeg`,
    attribution: [FM_ATTR, OSM_DATA_ATTR, ...(type === 'A' ? [] : [SRTM_ATTR])],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['Key' + type, false],
  };
}

export const baseLayers: BaseLayerDef[] = [
  {
    type: 'X',
    icon: <GiTreasureMap />,
    url: `${process.env['FM_MAPSERVER_URL']}/{z}/{x}/{y}`,
    extraScales: [2, 3],
    attribution: [
      FM_ATTR,
      OSM_DATA_ATTR,
      SRTM_ATTR,
      {
        type: 'data',
        name: 'LLS: ÚGKK SR',
        url: 'https://www.geoportal.sk/sk/udaje/lls-dmr/',
      },
    ],
    minZoom: 6,
    maxNativeZoom: 19,
    key: ['KeyX', false],
  },
  legacyFreemap('A', <FaCar />),
  legacyFreemap('T', <FaHiking />),
  legacyFreemap('C', <FaBicycle />),
  legacyFreemap('K', <FaSkiingNordic />),
  {
    type: 'O',
    icon: <SiOpenstreetmap />,
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    key: ['KeyO', false],
  },
  {
    type: 'S',
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
    type: 'Z',
    url: 'https://ofmozaika.tiles.freemap.sk/{z}/{x}/{y}.jpg',
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
    key: ['KeyZ', false],
    errorTileUrl: white1x1,
  },
  {
    type: 'M',
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
    type: 'p',
    url: '//tile.opentopomap.org/{z}/{x}/{y}.png',
    minZoom: 3,
    maxNativeZoom: 17,
    icon: <FaTree />,

    attribution: [
      {
        type: 'map',
        name: '©\xa0OpenTopoMap',
        url: 'https://tile.opentopomap.org/about#verwendung',
      },
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
    key: ['KeyN', false],
  },
  {
    type: 'd',
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
    type: 'h',
    url: '//tms.freemap.sk/historicke/{z}/{x}/{y}.png',
    minZoom: 8,
    maxNativeZoom: 12,
    icon: <AiFillBank />,

    attribution: [],
    key: ['KeyH', false],
  },
  {
    type: '4',
    url: 'https://dmr5-light-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      {
        type: 'data',
        name: 'LLS: ÚGKK SR',
        url: 'https://www.geoportal.sk/sk/udaje/lls-dmr/',
      },
    ],
    key: ['KeyD', true],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
  },
  {
    type: '5',
    url: 'https://dmr5-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 17,
    icon: <GiHills />,
    attribution: [
      {
        type: 'data',
        name: 'LLS: ÚGKK SR',
        url: 'https://www.geoportal.sk/sk/udaje/lls-dmr/',
      },
    ],
    key: ['KeyD', false],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
  },
  {
    type: 'VO',
    url: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=0iOk4fgsz9fOXyDYCirE',
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
    type: 'VS',
    url: 'https://api.maptiler.com/maps/streets-v2/style.json?key=0iOk4fgsz9fOXyDYCirE',
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
];

export const overlayLayers: OverlayLayerDef[] = [
  {
    type: 'i',
    icon: <FaPencilAlt />,
    key: ['KeyI', true],
    attribution: [],
  },
  {
    type: 'I',
    icon: <FaCamera />,
    minZoom: 0,
    key: ['KeyF', true],
    zIndex: 4,
    attribution: [
      {
        type: 'photos',
        name: 'CC-BY-SA',
      },
    ],
  },
  {
    type: 'w',
    icon: <FaWikipediaW />,
    minZoom: 8,
    key: ['KeyW', true],
    zIndex: 4,
    attribution: [],
  },
  {
    type: 'l',
    icon: <FaTractor />,
    url: 'https://nlc.tiles.freemap.sk/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    key: ['KeyN', true],
    zIndex: 3,
    errorTileUrl: transparent1x1,
    // adminOnly: true,
  },
  ...(
    [
      ['s0', 'all'],
      ['s1', 'ride'],
      ['s2', 'run'],
      ['s3', 'water'],
      ['s4', 'winter'],
    ] as const
  ).map(([type, stravaType]) => ({
    type,
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
  })),
  {
    type: 'g',
    icon: <GiPathDistance />,
    url: '//gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    minZoom: 0,
    maxNativeZoom: 20,
    key: ['KeyG', true],

    zIndex: 3,
  },
  {
    type: 't',
    icon: <FaHiking />,
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['KeyT', true],

    zIndex: 3,
  },
  {
    type: 'c',
    icon: <FaBicycle />,
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: ['KeyC', true],

    zIndex: 3,
  },
  {
    type: 'q',
    icon: <FaSnowflake />,
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

    zIndex: 3,
  },
  ...(
    [
      ['n1', ''],
      ['n2', 'h'],
      ['n3', 'c'],
    ] as const
  ).map(([type, suffix]) => ({
    type,
    icon: <FaFont />,
    url: `//tiles.freemap.sk/names${suffix}/{z}/{x}/{y}.png`,
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    zIndex: 3,
  })),
  {
    type: 'r',
    icon: <BsPencilSquare />,
    url: '//dev.freemap.sk/layers/renderedby/?/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 12,
    key: ['KeyR', true],
    zIndex: 5,
    attribution: [FM_ATTR],
  },
];
