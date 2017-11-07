const baseSpecs = [['A', 'Automapa', 'car'], ['T', 'Turistická', 'male'], ['C', 'Cyklomapa', 'bicycle'], ['K', 'Lyžiarska', 'snowflake-o']];

export const baseLayers = [
  ...baseSpecs.map(([type, name, icon]) => ({
    name,
    type,
    icon,
    url: `//{s}.freemap.sk/${type}/{z}/{x}/{y}.{tileFormat}`,
    attribution: 'prispievatelia © <a href="https://osm.org/copyright">OpenStreetMap</a>',
    minZoom: 8,
    maxNativeZoom: 16,
    key: type.toLowerCase(),
  })),
  {
    name: 'Satelitná',
    type: 'S',
    icon: 'plane',
    minZoom: 0,
    maxNativeZoom: 18,
    key: 's',
  },
  {
    name: 'OpenStreetMap',
    type: 'O',
    icon: 'globe',
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    // showOnlyInExpertMode: true,
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    key: 'o',
  },
  {
    name: 'mtbmap.cz',
    type: 'M',
    url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
    minZoom: 3,
    maxNativeZoom: 18,
    showOnlyInExpertMode: true,
    attribution: 'Martin Tesař, osmmtb@gmail.com, dáta © prispievatelia <a href="https://osm.org/copyright">OpenStreetMap</a>',
    key: 'm',
  },
];

export const overlayLayers = [
  {
    name: 'Fotografie',
    type: 'I',
    icon: 'picture-o',
    minZoom: 0,
    key: 'f',
    zIndex: 3,
  },
  {
    name: 'Lesné cesty NLC',
    type: 'N',
    url: 'http://gpsteam.eu/cache/nlcml/{z}/{x}/{y}.png',
    attribution: '© <a href="http://www.nlcsk.org/">NLC Zvolen</a>',
    minZoom: 14,
    maxNativeZoom: 16,
    key: 'n',
    zIndex: 2,
  },
  {
    name: 'Turistické trasy',
    type: 't',
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    minZoom: 8,
    maxNativeZoom: 16,
    showOnlyInExpertMode: true,
    zIndex: 2,
  },
  {
    name: 'Cyklotrasy',
    type: 'c',
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    minZoom: 8,
    maxNativeZoom: 16,
    showOnlyInExpertMode: true,
    zIndex: 2,
  },
  {
    name: 'Render. klienti',
    type: 'r',
    url: '//old.freemap.sk/layers/renderedby/?/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 12,
    showOnlyInExpertMode: true,
    zIndex: 4,
  },
];

// http://tile.mtbmap.cz/mtbmap_tiles/11/1135/705.png
// http://mtbmap.cz/
// 3 - 18
