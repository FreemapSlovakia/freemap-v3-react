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
  networkFallback: 'Hiányzó csempék letöltése az internetről',
  networkFallbackHint:
    'Bekapcsolva: a letöltött területen kívülre húzva vagy közelebb nagyítva élő csempék jelennek meg, amíg van internetkapcsolat. Kikapcsolva: a térkép csak azt mutatja, ami le lett töltve.',
  deleteTitle: 'Offline térkép törlése',
  deleteConfirm: ({ name }) => (
    <>
      Biztosan törli a(z) <b>{name}</b> offline térképet az összes csempéjével
      együtt?
    </>
  ),
  browse: {
    intro:
      'A térképen látott csempék megőrizhetők későbbre, így az újra felkeresett területek internet nélkül is betöltődnek. Ez minden csempés rétegre vonatkozik, és független a letöltött offline térképektől.',
    mode: 'Csempék forrása',
    modes: {
      networkOnly: 'Csak internet',
      networkFirst: 'Internet, majd gyorsítótár',
      cacheFirst: 'Gyorsítótár, majd internet',
      cacheOnly: 'Csak gyorsítótár',
    },
    store: 'Az internetről letöltött csempék mentése',
    maxAge: 'Csempék megőrzése',
    maxSize: 'Méretkorlát',
    days: ({ days }) => <>{days} nap</>,
    keepForever: 'Amíg van hely',
    noSizeLimit: 'Nincs korlát',
    retentionHint:
      'A lejárt csempék törlődnek, a méretkorlát felett pedig a legrégebben megjelenítettek mennek elsőként.',
    cached: ({ tiles, size }) => (
      <>
        Tárolva: <strong>{tiles}</strong> csempe ({size})
      </>
    ),
    clear: 'Gyorsítótár ürítése',
    clearConfirm:
      'Biztosan eldobja a böngészés közben eltárolt összes csempét? A beállítások megmaradnak.',
  },
};

export default hu;
