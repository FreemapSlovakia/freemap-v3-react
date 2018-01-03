const OSM_MAP_ATTR = {
  type: 'data',
  name: '© OpenStreetMap',
  url: 'https://osm.org/',
};

const OSM_DATA_ATTR = {
  type: 'data',
  nameKey: 'mapLayers.attr.osmData',
  url: 'https://osm.org/copyright',
};

const FM_ATTR = {
  type: 'map',
  nameKey: 'mapLayers.attr.freemap',
};

const SRTM_ATTR = {
  type: 'data',
  nameKey: 'mapLayers.attr.srtm',
};

const STRAVA_ATTR = {
  type: 'map',
  name: '© Strava',
  url: 'https://www.strava.com/',
};

const NLC_ATTR = {
  type: 'map',
  name: '© NLC Zvolen',
  url: 'http://www.nlcsk.org/',
};

const INFOMAPA_ATTR = {
  type: 'map',
  name: '© infomapa.sk',
  url: 'http://www.infomapa.sk/',
};

export const baseLayers = [
  ...[
    ['A', 'car'],
    ['T', '!icon-hiking'],
    ['C', 'bicycle'],
    ['K', '!icon-skier-skiing'],
  ].map(([type, icon]) => ({
    type,
    icon,
    url: `//{s}.freemap.sk/${type}/{z}/{x}/{y}.{tileFormat}`,
    attribution: [
      FM_ATTR,
      OSM_DATA_ATTR,
      type !== 'A' && SRTM_ATTR,
    ].filter(a => a),
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
        name: '© Bing',
      },
      {
        type: 'map',
        name: '© Earthstar Geographics SIO',
      },
      {
        type: 'map',
        name: '© 2017 Microsoft Corporation',
      },
    ],
  },
  {
    type: 'O',
    icon: 'globe',
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [
      OSM_MAP_ATTR,
      OSM_DATA_ATTR,
    ],
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
        name: '© Martin Tesař',
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
        name: '© OpenTopoMap',
        url: 'https://tile.opentopomap.org/about#verwendung',
      },
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
    key: 'p',
  },
  {
    type: 'b',
    url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 20,
    icon: 'medkit',
    showOnlyInExpertMode: true,
    attribution: [
      {
        type: 'map',
        nameKey: 'mapLayers.attr.hot',
        url: 'http://hot.openstreetmap.org',
      },
      OSM_DATA_ATTR,
    ],
    key: 'b',
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
        name: '© MeMoMaps',
        url: 'https://memomaps.de/en/',
      },
      OSM_DATA_ATTR,
    ],
    key: 'd',
  },
  {
    type: 'i',
    icon: 'info',
    url: 'http://{s}.infomapa.sk/0/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 18,
    showOnlyInExpertMode: true,
    attribution: [
      INFOMAPA_ATTR,
      OSM_DATA_ATTR,
    ],
    key: 'i',
  },
  {
    type: 'j',
    icon: 'info',
    url: 'http://{s}.infomapa.sk/1/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 18,
    showOnlyInExpertMode: true,
    attribution: [
      INFOMAPA_ATTR,
      OSM_DATA_ATTR,
    ],
    key: 'j',
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

export const overlayLayers = [
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
    url: '//tiles.freemap.sk/nlc2016/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    key: 'N',
    zIndex: 2,
    adminOnly: true,
  },
  {
    type: 'l',
    icon: 'tree',
    url: 'http://gpsteam.eu/cache/nlcml/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 14,
    maxNativeZoom: 16,
    key: 'L',
    zIndex: 2,
    adminOnly: true,
  },
  ...['both', 'ride', 'run', 'water', 'winter'].map(([type], i) => ({
    type: `s${i}`,
    icon: 'scribd', // TODO use correct logo
    url: `//heatmap-external-{s}.strava.com/tiles/${type}/bluered/{z}/{x}/{y}.png?px=256`,
    attribution: [STRAVA_ATTR],
    minZoom: 0,
    maxNativeZoom: 16,
    key: type === 'both' ? 'H' : undefined,
    showOnlyInExpertMode: true,
    zIndex: 2,
  })),
  {
    type: 'g',
    icon: '!icon-gps-device',
    url: '//gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',
    attribution: [
      OSM_MAP_ATTR,
      OSM_DATA_ATTR,
    ],
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
    attribution: [
      FM_ATTR,
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
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
    attribution: [
      FM_ATTR,
      OSM_DATA_ATTR,
      SRTM_ATTR,
    ],
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
        name: '© OpenSnowMap.org',
      },
      OSM_DATA_ATTR,
    ],
    minZoom: 0,
    maxNativeZoom: 18,
    key: 'S',
    showOnlyInExpertMode: true,
    zIndex: 2,
  },
  {
    type: 'r',
    icon: 'pencil-square-o',
    url: '//old.freemap.sk/layers/renderedby/?/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 12,
    key: 'R',
    showOnlyInExpertMode: true,
    zIndex: 4,
    attribution: [
      FM_ATTR,
    ],
  },
];
