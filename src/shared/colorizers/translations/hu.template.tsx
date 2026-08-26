import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const hu: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Színezés szerint',
  legend: 'Jelmagyarázat',
  mode: {
    none: 'Inaktív',
    elevation: 'Magasság',
    steepness: 'Meredekség',
    speed: 'Sebesség',
    heartRate: 'Pulzusszám',
    cadence: 'Kadencia',
    power: 'Teljesítmény',
    temperature: 'Hőmérséklet',
    time: 'Idő',
    heading: 'Irány',
    battery: 'Akkumulátor',
    gsmSignal: 'GSM-jel',
    surface: 'Burkolat',
    roadType: 'Úttípus',
    hikeRating: 'Gyalogos nehézség',
    mtbRating: 'MTB-nehézség',
  },
  categories: {
    unknown: 'Ismeretlen',
    surface: {
      paved: 'Szilárd',
      cobbles: 'Macskakő',
      compacted: 'Tömörített',
      gravel: 'Kavics',
      ground: 'Földes',
    },
    roadType: {
      major: 'Főút',
      minor: 'Mellékút',
      track: 'Erdei út',
      path: 'Ösvény',
      footway: 'Gyalogút',
      cycleway: 'Kerékpárút',
      steps: 'Lépcső',
    },
    hikeRating: {
      t1: 'T1 – túra',
      t2: 'T2 – hegyi',
      t3: 'T3 – igényes hegyi',
      t4: 'T4 – alpesi',
      t5: 'T5 – igényes alpesi',
      t6: 'T6 – nehéz alpesi',
    },
  },
};

export default hu;
