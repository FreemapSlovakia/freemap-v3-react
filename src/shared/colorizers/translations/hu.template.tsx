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
  },
};

export default hu;
