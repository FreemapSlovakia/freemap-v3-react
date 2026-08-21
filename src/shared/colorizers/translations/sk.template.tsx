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
  },
};

export default sk;
