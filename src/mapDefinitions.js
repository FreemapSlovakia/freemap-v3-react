const baseSpecs = [['A', 'Automapa'], ['T', 'Turistická'], ['C', 'Cyklomapa'], ['K', 'Lyžiarska']];

export const baseLayers = [
  ...baseSpecs.map(
    ([type, name]) => ({
      name,
      type,
      url: `//{s}.freemap.sk/${type}/{z}/{x}/{y}.{tileFormat}`,
      attribution: 'prispievatelia © <a href="https://osm.org/copyright">OpenStreetMap</a>',
      minZoom: 7,
      maxNativeZoom: 16,
    }),
  ),
  {
    name: 'Satelitná',
    type: 'S',
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
    minZoom: 7,
    maxNativeZoom: 16,
  },
  {
    name: 'Turist. trasy',
    type: 't',
    url: '//tiles.freemap.sk/trails/{z}/{x}/{y}.png',
    minZoom: 7,
    maxNativeZoom: 16,
    showOnlyInExpertMode: true,
  },
  {
    name: 'Cyklotrasy',
    type: 'c',
    url: '//tiles.freemap.sk/cycle/{z}/{x}/{y}.png',
    minZoom: 7,
    maxNativeZoom: 16,
    showOnlyInExpertMode: true,
  },
];
