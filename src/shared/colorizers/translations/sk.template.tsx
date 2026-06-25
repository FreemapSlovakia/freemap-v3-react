import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ColorizerMessages } from './ColorizerMessages.js';

const sk: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Vyfarbiť podľa',
  premiumDuringLaunch: 'Prémiové — počas uvedenia zadarmo',
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
