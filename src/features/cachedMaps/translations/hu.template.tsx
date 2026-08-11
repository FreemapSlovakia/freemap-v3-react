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
  notEnoughSpace: ({ size, free }) => (
    <>
      Nincs elég hely: a letöltéshez körülbelül {size} szükséges, de ebben a
      böngészőben csak {free} érhető el. Félúton megállna.
    </>
  ),
  estSize: 'Becsült méret',
  startCaching: 'Letöltés indítása',
  cachedSuccess: ({ name }) => `A(z) „${name}” térkép sikeresen letöltődött.`,
  activate: 'Aktiválás',
  focus: 'Nagyítás a területre',
  namePrefix: 'Offline',
};

export default hu;
