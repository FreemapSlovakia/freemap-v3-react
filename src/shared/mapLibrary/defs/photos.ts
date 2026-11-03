import type { MapBody } from '@shared/mapDefinitions.js';

const def: MapBody<'gallery'> = {
  minZoom: 10,
  zIndex: 8,
  attribution: [
    {
      type: 'photos',
      nameKey: 'photosCc',
      url: 'https://creativecommons.org/',
    },
    {
      type: 'photos',
      name: 'Wikimedia Commons',
      url: 'https://commons.wikimedia.org/',
    },
  ],
};

export default def;
