import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const cs: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Obarvit podle',
  legend: 'Legenda',
  mode: {
    none: 'Neaktivní',
    elevation: 'Nadmořská výška',
    steepness: 'Sklon',
    speed: 'Rychlost',
    heartRate: 'Tepová frekvence',
    cadence: 'Kadence',
    power: 'Výkon',
    temperature: 'Teplota',
    time: 'Čas',
    heading: 'Směr',
    battery: 'Baterie',
    gsmSignal: 'GSM signál',
  },
};

export default cs;
