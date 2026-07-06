import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const hu: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Térkép mentése offline használatra',
  addOfflineMap: 'Offline térkép hozzáadása',
  emptyMessage:
    'Még nincsenek offline térképek mentve. Adj hozzá egyet, hogy internetkapcsolat nélkül is használhasd a térképeket.',
  zoom: 'Nagyítás',
  tiles: 'Csempék',
  size: 'Méret',
  ready: 'Kész',
  incomplete: ({ pct }) => <>Hiányos ({pct} %)</>,
  pause: 'Szünet',
  resume: 'Folytatás',
  total: 'Összesen',
  largeDownload: ({ tiles, size }) => (
    <>
      Nagy letöltés: {tiles} csempe (~{size}). Ez eltarthat egy ideig.
    </>
  ),
  estSize: 'Becsült méret',
  startCaching: 'Letöltés indítása',
  cachedSuccess: ({ name }) => `A(z) „${name}” térkép sikeresen letöltődött.`,
  activate: 'Aktiválás',
  namePrefix: 'Offline',
};

export default hu;
