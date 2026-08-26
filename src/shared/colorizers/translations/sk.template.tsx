import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const sk: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Vyfarbiť podľa',
  legend: 'Legenda',
  mode: {
    none: 'Neaktívne',
    elevation: 'Nadmorská výška',
    steepness: 'Sklon',
    speed: 'Rýchlosť',
    heartRate: 'Tepová frekvencia',
    cadence: 'Kadencia',
    power: 'Výkon',
    temperature: 'Teplota',
    time: 'Čas',
    heading: 'Smer',
    battery: 'Batéria',
    gsmSignal: 'GSM signál',
    surface: 'Povrch',
    smoothness: 'Kvalita povrchu',
    roadType: 'Typ cesty',
    trackType: 'Kvalita lesnej cesty',
    hikeRating: 'Náročnosť pešo',
    mtbRating: 'Náročnosť MTB',
  },
  categories: {
    unknown: 'Neznáme',
    surface: {
      paved: 'Spevnený',
      cobbles: 'Dlažba',
      compacted: 'Šotolina',
      gravel: 'Štrk',
      ground: 'Zemitý',
    },
    smoothness: {
      good: 'Dobrá',
      intermediate: 'Priemerná',
      bad: 'Zlá',
      veryBad: 'Veľmi zlá',
      impassable: 'Neprejazdná',
    },
    roadType: {
      major: 'Hlavná cesta',
      minor: 'Vedľajšia cesta',
      track: 'Lesná cesta',
      path: 'Chodník',
      footway: 'Cesta pre peších',
      cycleway: 'Cyklotrasa',
      steps: 'Schody',
    },
    trackType: {
      grade1: '1 – spevnená',
      grade2: '2 – prevažne spevnená',
      grade3: '3 – zmiešaná',
      grade4: '4 – prevažne mäkká',
      grade5: '5 – mäkká',
    },
    hikeRating: {
      t1: 'T1 – turistika',
      t2: 'T2 – horská',
      t3: 'T3 – náročná horská',
      t4: 'T4 – alpská',
      t5: 'T5 – náročná alpská',
      t6: 'T6 – ťažká alpská',
    },
  },
};

export default sk;
