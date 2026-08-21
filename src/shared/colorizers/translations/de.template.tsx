import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const de: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Einfärben nach',
  legend: 'Legende',
  mode: {
    none: 'Inaktiv',
    elevation: 'Höhe',
    steepness: 'Steigung',
    speed: 'Geschwindigkeit',
    heartRate: 'Herzfrequenz',
    cadence: 'Trittfrequenz',
    power: 'Leistung',
    temperature: 'Temperatur',
    time: 'Zeit',
    heading: 'Richtung',
    battery: 'Batterie',
    gsmSignal: 'GSM-Signal',
  },
};

export default de;
