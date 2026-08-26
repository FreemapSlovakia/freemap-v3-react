import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const sl: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Obarvaj po',
  legend: 'Legenda',
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
    roadType: 'Vrsta poti',
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
    roadType: {
      major: 'Glavna cesta',
      minor: 'Stranska cesta',
      track: 'Gozdna cesta',
      path: 'Steza',
      footway: 'Pešpot',
      cycleway: 'Kolesarska pot',
      steps: 'Stopnice',
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
