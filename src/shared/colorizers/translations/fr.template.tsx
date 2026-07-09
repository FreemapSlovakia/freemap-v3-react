import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const fr: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Colorer selon',
  premiumDuringLaunch: 'Premium — gratuit pendant le lancement',
  legend: 'Légende',
  compass: {
    n: 'N',
    e: 'E',
    s: 'S',
    w: 'O',
  },
  mode: {
    none: 'Inactif',
    elevation: 'Altitude',
    steepness: 'Pente',
    speed: 'Vitesse',
    heartRate: 'Fréquence cardiaque',
    cadence: 'Cadence',
    power: 'Puissance',
    temperature: 'Température',
    time: 'Temps',
    heading: 'Cap',
    battery: 'Batterie',
    gsmSignal: 'Signal GSM',
  },
};

export default fr;
