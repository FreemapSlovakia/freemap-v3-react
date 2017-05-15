const baseSpecs = [['A', 'Automapa'], ['T', 'Turistická'], ['C', 'Cyklomapa'], ['K', 'Lyžiarska']];

export const baseLayers = [
  ...baseSpecs.map(
    ([type, name]) => ({
      name,
      type,
      url: `//{s}.freemap.sk/${type}/{z}/{x}/{y}.{tileFormat}`,
      attribution: 'prispievatelia © <a href="https://osm.org/copyright">OpenStreetMap</a>',
      minZoom: 8,
      maxNativeZoom: 16,
    }),
  ),
  {
    name: 'Satelitná',
    type: 'S',
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
    name: 'Lesné cesty NLC',
    type: 'N',
    url: 'http://gpsteam.eu/cache/nlcml/{z}/{x}/{y}.png',
    attribution: '© <a href="http://www.nlcsk.org/">NLC Zvolen</a>',
    minZoom: 14,
    maxNativeZoom: 16,
  },
  {
    name: 'Galéria obrázkov',
    type: 'I',
    url: 'http://t1.freemap.sk/data/layers/presets/X~I/{z}/{x}/{y}t.png',
    minZoom: 8,
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
];

// http://tile.mtbmap.cz/mtbmap_tiles/11/1135/705.png
// http://mtbmap.cz/
// 3 - 18
