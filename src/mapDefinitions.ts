const OSM_MAP_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0OpenStreetMap',
  url: 'https://osm.org/',
};

const OSM_DATA_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'mapLayers.attr.osmData',
  url: 'https://osm.org/copyright',
};

const FM_ATTR: AttributionDef = {
  type: 'map',
  nameKey: 'mapLayers.attr.freemap',
};

const SRTM_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'mapLayers.attr.srtm',
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

export interface AttributionDef {
  type: string;
  name?: string;
  nameKey?: string;
  url?: string;
}

export interface LayerDef {
  type: string;
  icon: string;
  url?: string;
  attribution: AttributionDef[];
  minZoom?: number;
  minNativeZoom?: number;
  maxNativeZoom?: number;
  key: string | undefined; // TODO undefined only in overlays
  showOnlyInExpertMode?: boolean;
  adminOnly?: boolean;
  zIndex?: number; // TODO only overlays
  subdomains?: string;
  strava?: boolean;
}

export const baseLayers: LayerDef[] = [
  {
    type: 'X',
    icon: 'tree',
    url: scaleUrl([1, 2, 3], 'https://outdoor.tiles.freemap.sk/{z}/{x}/{y}'),
    attribution: [FM_ATTR, OSM_DATA_ATTR, SRTM_ATTR],
    minZoom: 6,
    maxNativeZoom: 19,
    key: 'x',
  },
  ...[
    ['A', 'car'],
    ['T', '!icon-hiking'],
    ['C', 'bicycle'],
    ['K', '!icon-skier-skiing'],
  ].map(([type, icon]) => ({
    type,
    icon,
    url: `//{s}.freemap.sk/${type}/{z}/{x}/{y}.{tileFormat}`,
    subdomains: 'abcd',
    attribution: [FM_ATTR, OSM_DATA_ATTR, ...(type === 'A' ? [] : [SRTM_ATTR])],
    minZoom: 8,
    maxNativeZoom: 16,
    key: type.toLowerCase(),
  })),
  {
    type: 'S',
    icon: 'plane',
    minZoom: 0,
    maxNativeZoom: 18,
    key: 's',
    attribution: [
      {
        type: 'map',
        name: '©\xa0Bing',
      },
      {
        type: 'map',
        name: '©\xa0Earthstar Geographics SIO',
      },
      {
        type: 'map',
        name: '©\xa02017 Microsoft Corporation',
      },
    ],
  },
  {
    type: 'O',
    icon: 'globe',
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    key: 'o',
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
    key: 'm',
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
    key: 'p',
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
    key: 'd',
  },
  {
    type: 'h',
    url: 'http://tms.freemap.sk/historicke/{z}/{x}/{y}.png',
    minNativeZoom: 12,
    maxNativeZoom: 12,
    icon: 'institution',
    showOnlyInExpertMode: true,
    attribution: [],
    key: 'h',
  },
];

if (!process.env.NODE_ENV) {
  baseLayers.push({
    type: 'Y',
    icon: 'flask',
    url: scaleUrl([1, 2, 3], 'http://localhost:4000/{z}/{x}/{y}'),
    attribution: [FM_ATTR, OSM_DATA_ATTR, SRTM_ATTR],
    minZoom: 6,
    maxNativeZoom: 19,
    key: 'y',
  });
}

function findNearestScale(
  scales: number[],
  ratio = window.devicePixelRatio || 1,
) {
  let dif = Number.POSITIVE_INFINITY;
  let prevScale = scales[0];
  for (const scale of scales) {
    const newDif = Math.abs(ratio - scale);
    if (newDif >= dif) {
      return prevScale;
    }
    prevScale = scale;
    dif = newDif;
  }

  return prevScale;
}

function scaleUrl(scales: number[], url: string) {
  const scale = findNearestScale(scales);
  return scale === 1 ? url : `${url}@${scale}x`;
}

export const overlayLayers: LayerDef[] = [
  {
    type: 'I',
    icon: 'picture-o',
    minZoom: 0,
    key: 'F',
    zIndex: 3,
    attribution: [
      {
        type: 'photos',
        name: 'CC-BY-SA',
      },
    ],
  },
  {
    type: 'n',
    icon: 'tree',
    url: '//tiles.freemap.sk/nlc2017/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    key: 'N',
    zIndex: 2,
    adminOnly: true,
  },
  ...['both', 'ride', 'run', /* 'water', */ 'winter'].map((type, i) => ({
    type: `s${i}`,
    icon: 'scribd', // TODO use correct logo
    url: `//heatmap-external-{s}.strava.com/tiles-auth/${type}/bluered/{z}/{x}/{y}.png?px=256`,
    attribution: [STRAVA_ATTR],
    minZoom: 0,
    maxNativeZoom: 16,
    key: type === 'both' ? 'H' : undefined,
    showOnlyInExpertMode: true,
    zIndex: 2,
    strava: true,
  })),
  {
    type: 'g',
    icon: '!icon-gps-device',
    url: '//gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    minZoom: 0,
    maxNativeZoom: 20,
    key: 'G',
    showOnlyInExpertMode: true,
    zIndex: 2,
  },
  {
    type: 't',
    icon: '!icon-hiking',
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: 'T',
    showOnlyInExpertMode: true,
    zIndex: 2,
  },
  {
    type: 'c',
    icon: 'bicycle',
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    attribution: [FM_ATTR, OSM_DATA_ATTR],
    minZoom: 8,
    maxNativeZoom: 16,
    key: 'C',
    showOnlyInExpertMode: true,
    zIndex: 2,
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
    key: 'S',
    showOnlyInExpertMode: true,
    zIndex: 2,
  },
  ...[['1', '1', ''], ['2', '2', 'h'], ['3', '3', 'c']].map(
    ([type, key, suffix]) => ({
      type,
      icon: 'font',
      url: `//tiles.freemap.sk/names${suffix}/{z}/{x}/{y}.png`,
      attribution: [FM_ATTR, OSM_DATA_ATTR],
      minZoom: 8,
      maxNativeZoom: 16,
      key,
      showOnlyInExpertMode: true,
      zIndex: 2,
    }),
  ),
  {
    type: 'r',
    icon: 'pencil-square-o',
    url: '//old.freemap.sk/layers/renderedby/?/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 12,
    key: 'R',
    showOnlyInExpertMode: true,
    zIndex: 4,
    attribution: [FM_ATTR],
  },
];
