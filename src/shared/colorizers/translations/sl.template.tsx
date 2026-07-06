import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const sl: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Obarvaj po',
  premiumDuringLaunch: 'Premium — brezplačno med uvajanjem',
  legend: 'Legenda',
  compass: {
    n: 'S',
    e: 'V',
    s: 'J',
    w: 'Z',
  },
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
  },
};

export default sl;
