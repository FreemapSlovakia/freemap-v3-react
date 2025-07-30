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
import { is } from 'typia';
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
  country?: string;
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
  name: '©\xa0Freemap Slovakia',
  url: 'https://www.freemap.sk',
};

const SRTM_ATTR: AttributionDef = {
  type: 'data',
  name: 'SRTM1: USGS EarthExplorer',
  url: 'https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-shuttle-radar-topography-mission-srtm-1',
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
  kbd?: [code: string, shift: boolean];
  premiumFromZoom?: number;
  experimental?: boolean;
  attribution: AttributionDef[];
  countries?: string[];
  defaultInToolbar?: boolean;
  defaultInMenu?: boolean;
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
    technology: 'tile';
    subdomains?: string | string[];
    tms?: boolean;
    extraScales?: number[];
    errorTileUrl?: string;
    cors?: boolean;
  };

export type IsBaseLayerDef = {
  layer: 'base';
  type: string;
};

export type IsOverlayLayerDef = HasZIndex & {
  layer: 'overlay';
  type: string;
};

export type IsAllTechnologiesLayerDef =
  | (IsTileLayerDef & {
      creditsPerMTile?: number;
    })
  | IsMapLibreLayerDef
  | IsParametricShadingLayerDef
  | IsGalleryLayerDef
  | IsInteractiveLayerDef
  | IsWikipediaLayerDef;

export type CustomBaseLayerDef = IsTileLayerDef &
  IsBaseLayerDef &
  IsCommonLayerDef;

export type CustomOverlayLayerDef = IsTileLayerDef &
  IsOverlayLayerDef &
  IsCommonLayerDef;

export type CustomLayerDef = CustomBaseLayerDef | CustomOverlayLayerDef;

export type HasLegacy = {
  superseededBy?: string;
};

export type IntegratedBaseLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = T & IsCommonLayerDef & IsIntegratedLayerDef & IsBaseLayerDef & HasLegacy;

export type IntegratedOverlayLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = T & IsCommonLayerDef & IsIntegratedLayerDef & IsOverlayLayerDef & HasLegacy;

export type IntegratedLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = IntegratedBaseLayerDef<T> | IntegratedOverlayLayerDef<T>;

export type BaseLayerDef = IntegratedBaseLayerDef | CustomBaseLayerDef;

export type OverlayLayerDef = IntegratedOverlayLayerDef | CustomOverlayLayerDef;

export type LayerDef = CustomLayerDef | IntegratedLayerDef;

type OldCustomLayerDef = Omit<CustomLayerDef, 'layer' | 'technology'> & {
  layer?: 'base' | 'overlay';
  technology?: 'tile';
};

export function upgradeCustomLayers(customLayers: unknown[]) {
  return customLayers
    .filter((cl) => is<OldCustomLayerDef>(cl))
    .map((cl) => ({
      ...cl,
      layer: cl.type.charAt(0) === ':' ? 'overlay' : 'base',
      technology: 'tile',
    }));
}

function legacyFreemap(
  type: string,
  icon: ReactElement,
  defaultInMenu?: boolean,
): IntegratedBaseLayerDef {
  return {
    technology: 'tile',
    layer: 'base',
    type,
    defaultInMenu,
    icon,
    url: `//tile.freemap.sk/${type}/{z}/{x}/{y}.jpeg`,
    attribution: [FM_ATTR, OSM_DATA_ATTR, ...(type === 'A' ? [] : [SRTM_ATTR])],
    minZoom: 8,
    maxNativeZoom: 16,
    kbd: ['Key' + type, false],
    creditsPerMTile: 1000,
    countries: ['sk'],
    superseededBy: type === 'A' ? undefined : 'X',
  };
}

export const integratedLayerDefs: IntegratedLayerDef[] = [
  {
    layer: 'base',
    type: 'X',
    defaultInMenu: true,
    defaultInToolbar: true,
    technology: 'tile',
    icon: <GiTreasureMap />,
    url: `${process.env['FM_MAPSERVER_URL']}/{z}/{x}/{y}`,
    extraScales: [2, 3],
    attribution: [
      FM_ATTR,
      OSM_DATA_ATTR,
      {
        type: 'data',
        country: 'at',
        name: 'ALS DTM: Digitales Geländemodell Österreich (Geoland.at open data)',
        url: 'https://www.data.gv.at/katalog/dataset/d88a1246-9684-480b-a480-ff63286b35b7',
      },
      {
        type: 'data',
        country: 'cz',
        name: 'DMR 5G: ČÚZK Geoportál',
        url: 'https://geoportal.cuzk.cz/(S(a21rqp1jhcnkz4iqcen2w50l))/Default.aspx?head_tab=sekce-02-gp&lng=EN&menu=302&metadataID=CZ-CUZK-DMR5G-V&mode=TextMeta&side=vyskopis',
      },
      {
        type: 'data',
        country: 'fr',
        name: 'RGE ALTI: IGN (Etalab Open Licence)',
        url: 'https://geoservices.ign.fr/rgealti',
      },
      {
        type: 'data',
        country: 'it',
        name: 'Tinitaly DEM: INGV',
        url: 'https://tinitaly.pi.ingv.it/',
      },
      {
        type: 'data',
        country: 'pl',
        name: 'NMT: GUGiK',
        url: 'https://www.geoportal.gov.pl/',
      },
      {
        type: 'data',
        country: 'sk',
        name: 'DMR 5.0: ÚGKK SR',
        url: 'https://www.geoportal.sk/sk/udaje/lls-dmr/',
      },
      {
        type: 'data',
        country: 'si',
        name: 'DMR: Ministrstvo za okolje in prostor',
        url: 'https://gis.arso.gov.si/evode/profile.aspx?id=atlas_voda_Lidar@Arso',
      },
      {
        type: 'data',
        country: 'ch',
        name: 'swissALTI3D: © swisstopo',
        url: 'https://www.swisstopo.admin.ch/en/height-models/swissalti3d.html',
      },
    ],
    minZoom: 6,
    maxNativeZoom: 19,
    kbd: ['KeyX', false],
    premiumFromZoom: 19,
    creditsPerMTile: 5000,
    countries: [
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
  legacyFreemap('T', <FaHiking />, true),
  legacyFreemap('C', <FaBicycle />, true),
  legacyFreemap('K', <FaSkiingNordic />),
  {
    layer: 'base',
    type: 'O',
    defaultInToolbar: true,
    defaultInMenu: true,
    technology: 'tile',
    icon: <SiOpenstreetmap />,
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    kbd: ['KeyO', false],
  },
  {
    layer: 'base',
    type: 'S',
    defaultInMenu: true,
    technology: 'tile',
    url: 'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server', 'services'],
    icon: <FaPlane />,
    minZoom: 0,
    maxNativeZoom: 19,
    scaleWithDpi: true,
    kbd: ['KeyS', false],
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
    defaultInToolbar: true,
    defaultInMenu: true,
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
        country: 'sk',
      },
      {
        type: 'map',
        name: '©\xa0ČÚZK',
        url: 'https://geoportal.cuzk.cz/',
        country: 'cz',
      },
    ],
    kbd: ['KeyZ', false],
    errorTileUrl: white1x1,
    premiumFromZoom: 20,
    creditsPerMTile: 1000,
    countries: ['sk', 'cz'],
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
    kbd: ['KeyZ', true],
    errorTileUrl: white1x1,
    creditsPerMTile: 1000,
    countries: ['sk'],
  },
  {
    layer: 'base',
    type: 'd',
    defaultInMenu: true,
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
    kbd: ['KeyQ', false],
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
    kbd: ['KeyD', true],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    countries: ['sk'],
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
    kbd: ['KeyH', false],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    premiumFromZoom: 17,
    creditsPerMTile: 1000,
    countries: ['sk'],
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
    kbd: ['KeyL', false],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    premiumFromZoom: 16,
    countries: ['cz'],
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
    kbd: ['KeyD', false],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    countries: ['sk'],
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
    kbd: ['KeyF', false],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    countries: ['sk'],
  },
  {
    layer: 'base',
    type: 'VO',
    technology: 'maplibre',
    url: maptiler('openstreetmap'),
    kbd: ['KeyV', false],
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
    defaultInMenu: true,
    technology: 'maplibre',
    url: maptiler('streets-v2'),
    kbd: ['KeyR', false],
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
    kbd: ['KeyM', false],
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
    defaultInMenu: true,
    technology: 'maplibre',
    url: maptiler('outdoor-v2'),
    kbd: ['KeyU', false],
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
    layer: 'overlay',
    type: 'i',
    technology: 'interactive',
    icon: <FaPencilAlt />,
    kbd: ['KeyI', true],
    attribution: [],
  },
  {
    layer: 'overlay',
    type: 'I',
    defaultInToolbar: true,
    defaultInMenu: true,
    technology: 'gallery',
    icon: <FaCamera />,
    minZoom: 0,
    kbd: ['KeyF', true],
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
    defaultInMenu: true,
    technology: 'wikipedia',
    icon: <FaWikipediaW />,
    minZoom: 8,
    kbd: ['KeyW', true],
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
    kbd: ['KeyJ', true],
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
    countries: ['sk'],
  },
  {
    layer: 'overlay',
    type: 'z',
    technology: 'parametricShading',
    url: 'https://www.freemap.sk/tiles/parametric-shading/cz/{z}/{x}/{y}',
    icon: <GiHills />,
    kbd: ['KeyK', true],
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
    countries: ['cz'],
  },
  {
    layer: 'overlay',
    type: 'l',
    defaultInMenu: true,
    technology: 'tile',
    icon: <FaTractor />,
    url: 'https://nlc.tiles.freemap.sk/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    kbd: ['KeyN', true],
    zIndex: 3,
    errorTileUrl: transparent1x1,
    // adminOnly: true,
    creditsPerMTile: 1000,
    countries: ['sk'],
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
        defaultInMenu: true,
        technology: 'tile' as const,
        icon: <FaStrava />,
        url: `//strava-heatmap.tiles.freemap.sk/${stravaType}/purple/{z}/{x}/{y}.png`,
        attribution: [STRAVA_ATTR],
        minZoom: 0,
        maxNativeZoom: 15, // for @2x.png is max 14, otherwise 15; also @2x.png tiles are 1024x1024 and "normal" are 512x512 so no need to use @2x
        kbd: (stravaType === 'all' ? ['KeyH', true] : undefined) as
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
    countries: ['sk'],
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
    countries: ['sk'],
  },
];

function maptiler(style: string) {
  return `https://api.maptiler.com/maps/${style}/style.json?key=KgKDGG75zYDIyCCTAG6L`;
}
