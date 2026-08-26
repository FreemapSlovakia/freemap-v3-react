import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const it: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Colora per',
  legend: 'Legenda',
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
    surface: 'Fondo',
    roadType: 'Tipo di strada',
    hikeRating: 'Difficoltà a piedi',
    mtbRating: 'Difficoltà MTB',
  },
  categories: {
    unknown: 'Sconosciuto',
    surface: {
      paved: 'Asfaltato',
      cobbles: 'Pavé',
      compacted: 'Compattato',
      gravel: 'Ghiaia',
      ground: 'Sterrato',
    },
    roadType: {
      major: 'Strada principale',
      minor: 'Strada secondaria',
      track: 'Strada forestale',
      path: 'Sentiero',
      footway: 'Percorso pedonale',
      cycleway: 'Pista ciclabile',
      steps: 'Scalini',
    },
    hikeRating: {
      t1: 'T1 – escursionismo',
      t2: 'T2 – montagna',
      t3: 'T3 – montagna impegnativa',
      t4: 'T4 – alpinistico',
      t5: 'T5 – alpinistico impegnativo',
      t6: 'T6 – alpinistico difficile',
    },
  },
};

export default it;
