import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ColorizerMessages } from './ColorizerMessages.js';

const it: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Colora per',
  premiumDuringLaunch: 'Premium — gratis durante il lancio',
  legend: 'Legenda',
  compass: {
    n: 'N',
    e: 'E',
    s: 'S',
    w: 'O',
  },
  mode: {
    none: 'Inattivo',
    elevation: 'Elevazione',
    steepness: 'Ripidezza',
    speed: 'Velocità',
    heartRate: 'Frequenza cardiaca',
    cadence: 'Cadenza',
    power: 'Potenza',
    temperature: 'Temperatura',
    time: 'Tempo',
    heading: 'Direzione',
    battery: 'Batteria',
    gsmSignal: 'Segnale GSM',
  },
};

export default it;
