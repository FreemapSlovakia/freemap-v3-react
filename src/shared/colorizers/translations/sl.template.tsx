import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const sl: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Obarvaj po',
  legend: 'Legenda',
  steepnessScale: 'Razpon naklona',
  mode: {
    none: 'Neaktivno',
    elevation: 'Nadmorska višina',
    steepness: 'Naklon',
    speed: 'Hitrost',
    heartRate: 'Srčni utrip',
    cadence: 'Kadenca',
    power: 'Moč',
    temperature: 'Temperatura',
    time: 'Čas',
    heading: 'Smer',
    battery: 'Baterija',
    gsmSignal: 'Signal GSM',
    surface: 'Podlaga',
    smoothness: 'Kakovost podlage',
    roadType: 'Vrsta poti',
    trackType: 'Kakovost gozdne ceste',
    hikeRating: 'Peš zahtevnost',
    mtbRating: 'Zahtevnost MTB',
  },
  categories: {
    unknown: 'Neznano',
    surface: {
      paved: 'Utrjena',
      cobbles: 'Tlakovci',
      compacted: 'Nabita',
      gravel: 'Gramoz',
      ground: 'Zemljena',
    },
    smoothness: {
      good: 'Dobra',
      intermediate: 'Povprečna',
      bad: 'Slaba',
      veryBad: 'Zelo slaba',
      impassable: 'Neprevozna',
    },
    roadType: {
      major: 'Glavna cesta',
      minor: 'Stranska cesta',
      track: 'Gozdna cesta',
      path: 'Steza',
      footway: 'Pešpot',
      cycleway: 'Kolesarska pot',
      steps: 'Stopnice',
    },
    trackType: {
      grade1: '1 – utrjena',
      grade2: '2 – pretežno utrjena',
      grade3: '3 – mešana',
      grade4: '4 – pretežno mehka',
      grade5: '5 – mehka',
    },
    hikeRating: {
      t1: 'T1 – pohodništvo',
      t2: 'T2 – gorsko',
      t3: 'T3 – zahtevno gorsko',
      t4: 'T4 – alpsko',
      t5: 'T5 – zahtevno alpsko',
      t6: 'T6 – težko alpsko',
    },
  },
};

export default sl;
