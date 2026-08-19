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
  offlineWiden:
    'Without a connection this map can be made smaller, but not larger — enlarging it would have to download tiles it does not hold.',
  premiumSkipped:
    'The deepest zoom levels of this map are premium and were not downloaded, so it stays marked incomplete.',
  networkFallback: 'Fetch missing tiles from the internet',
  networkFallbackHint:
    'On, panning outside the downloaded area or zooming deeper shows live tiles as long as there is an internet connection. Off, the map shows only what was downloaded.',
  deleteTitle: 'Delete offline map',
  deleteConfirm: ({ name }) => (
    <>
      Really delete the offline map <b>{name}</b> and every tile it holds?
    </>
  ),
  browse: {
    intro:
      'Tiles you come across on the map can be kept for later, so areas you revisit load without an internet connection. This covers every tile layer and is separate from the downloaded offline maps.',
    mode: 'Serve tiles from',
    modes: {
      networkOnly: 'Internet only',
      networkFirst: 'Internet, then cache',
      cacheFirst: 'Cache, then internet',
      cacheOnly: 'Cache only',
    },
    store: 'Save tiles fetched from the internet',
    maxAge: 'Keep tiles for',
    maxSize: 'Cache size limit',
    days: ({ days }) => <>{days} days</>,
    keepForever: 'Until space runs out',
    noSizeLimit: 'No limit',
    retentionHint:
      'Tiles past their age are dropped, and over the size limit the least recently shown ones go first.',
    cached: ({ tiles, size }) => (
      <>
        Cached: <strong>{tiles}</strong> tiles ({size})
      </>
    ),
    clear: 'Clear cache',
    clearConfirm:
      'Really drop every tile kept while browsing? The settings stay as they are.',
  },
};

export default en;
