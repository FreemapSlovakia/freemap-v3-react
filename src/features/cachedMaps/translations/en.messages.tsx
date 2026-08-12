import type { CachedMapsMessages } from './CachedMapsMessages.js';

const en: CachedMapsMessages = {
  cacheOfflineMap: 'Cache map for offline use',
  modifyOfflineMap: 'Modify offline map',
  toDownload: 'To download',
  addOfflineMap: 'Add offline map',
  emptyMessage:
    'No offline maps cached yet. Add one to use maps without internet connection.',
  zoom: 'Zoom',
  tiles: 'Tiles',
  size: 'Size',
  ready: 'Ready',
  incomplete: ({ pct }) => <>Incomplete ({pct}%)</>,
  resume: 'Resume',
  stop: 'Stop',
  total: 'Total',
  largeDownload: ({ tiles, size }) => (
    <>
      Large download: {tiles} tiles (~{size}). This may take a while.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Not enough space: the download needs about {size}, but only {free} is
      available in this browser. It would stop partway through.
    </>
  ),
  estSize: 'Est. size',
  startCaching: 'Start caching',
  cachedSuccess: ({ name }) => `Map "${name}" cached successfully.`,
  activate: 'Activate',
  focus: 'Zoom to area',
  namePrefix: 'Offline',
};

export default en;
