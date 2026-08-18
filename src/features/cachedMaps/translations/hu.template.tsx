import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const hu: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Térkép mentése offline használatra',
  modifyOfflineMap: 'Offline térkép módosítása',
  toDownload: 'Letöltendő',
  addOfflineMap: 'Offline térkép hozzáadása',
  emptyMessage:
    'Még nincsenek offline térképek mentve. Adj hozzá egyet, hogy internetkapcsolat nélkül is használhasd a térképeket.',
  zoom: 'Nagyítás',
  tiles: 'Csempék',
  size: 'Méret',
  ready: 'Kész',
  incomplete: ({ pct }) => <>Hiányos ({pct} %)</>,
  resume: 'Folytatás',
  stop: 'Leállítás',
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
  offlineWiden:
    'Kapcsolat nélkül ez a térkép csak kisebbé tehető, nagyobbá nem — a nagyításhoz olyan csempéket kellene letölteni, amelyeket nem tartalmaz.',
  premiumZoomHint:
    'Ennek a rétegnek a legrészletesebb nagyítási szintjei prémiumok. Az offline térkép véglegesen megtartja a csempéket, és kapcsolat nélkül is megjeleníti őket, ezért letöltésükhöz prémium hozzáférés szükséges.',
  premiumWiden:
    'Ez a térkép prémium nagyítási szintekig ér. Prémium hozzáférés nélkül kicsinyíthető, de nem nagyítható — a nagyítás újra letöltené a prémium csempéket.',
  premiumSkipped:
    'Ennek a térképnek a legrészletesebb nagyítási szintjei prémiumok, és nem töltődtek le, ezért a térkép hiányosként marad megjelölve.',
};

export default hu;
