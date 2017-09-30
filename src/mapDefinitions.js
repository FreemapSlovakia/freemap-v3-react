const baseSpecs = [['A', 'Automapa', 'car'], ['T', 'Turistická', 'male'], ['C', 'Cyklomapa', 'bicycle'], ['K', 'Lyžiarska', 'snowflake-o']];

export const baseLayers = [
  ...baseSpecs.map(
    ([type, name, icon]) => ({
      name,
      type,
      icon,
      url: `//{s}.freemap.sk/${type}/{z}/{x}/{y}.{tileFormat}`,
      attribution: 'prispievatelia © <a href="https://osm.org/copyright">OpenStreetMap</a>',
      minZoom: 8,
      maxNativeZoom: 16,
    }),
  ),
  {
    name: 'Satelitná',
    type: 'S',
    icon: 'plane',
    minZoom: 0,
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
  },
  {
    name: 'mtbmap.cz',
    type: 'M',
    url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
    minZoom: 3,
    maxNativeZoom: 18,
    showOnlyInExpertMode: true,
    attribution: 'Martin Tesař, osmmtb (at) gmail.com, prispievatelia © <a href="https://osm.org/copyright">OpenStreetMap</a>',
  },
];

export const overlayLayers = [
  {
    name: 'Fotografie',
    type: 'I',
    icon: 'picture-o',
    minZoom: 0,
  },
  {
    name: 'Lesné cesty NLC',
    type: 'N',
    url: 'http://gpsteam.eu/cache/nlcml/{z}/{x}/{y}.png',
    attribution: '© <a href="http://www.nlcsk.org/">NLC Zvolen</a>',
    minZoom: 14,
    maxNativeZoom: 16,
  },
  {
    name: 'Turistické trasy',
    type: 't',
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    minZoom: 8,
    maxNativeZoom: 16,
    showOnlyInExpertMode: true,
  },
  {
    name: 'Cyklotrasy',
    type: 'c',
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    minZoom: 8,
    maxNativeZoom: 16,
    showOnlyInExpertMode: true,
  },
  {
    name: 'Render. klienti',
    type: 'r',
    url: '//www.freemap.sk/layers/renderedby/?/{z}/{x}/{y}',
    minZoom: 8,
    maxNativeZoom: 12,
    showOnlyInExpertMode: true,
  },
];

// http://tile.mtbmap.cz/mtbmap_tiles/11/1135/705.png
// http://mtbmap.cz/
// 3 - 18
