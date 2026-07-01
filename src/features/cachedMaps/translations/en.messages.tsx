import { CachedMapsMessages } from './CachedMapsMessages.js';

const en: CachedMapsMessages = {
  cacheOfflineMap: 'Cache map for offline use',
  addOfflineMap: 'Add offline map',
  emptyMessage:
    'No offline maps cached yet. Add one to use maps without internet connection.',
  zoom: 'Zoom',
  tiles: 'Tiles',
  size: 'Size',
  ready: 'Ready',
  incomplete: ({ pct }) => <>Incomplete ({pct}%)</>,
  pause: 'Pause',
  resume: 'Resume',
  total: 'Total',
  largeDownload: ({ tiles, size }) => (
    <>
      Large download: {tiles} tiles (~{size}). This may take a while.
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
