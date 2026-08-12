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
  premiumZoomHint:
    "This layer's deepest zoom levels are premium. An offline map keeps its tiles for good and shows them with no connection, so downloading those levels needs premium access.",
  premiumWiden:
    'This map reaches premium zoom levels. Without premium access it can be made smaller, but not larger — enlarging it would download premium tiles anew.',
  premiumSkipped:
    'The deepest zoom levels of this map are premium and were not downloaded, so it stays marked incomplete.',
};

export default en;
