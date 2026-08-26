import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const fr: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Colorer selon',
  legend: 'Légende',
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
    surface: 'Revêtement',
    roadType: 'Type de voie',
    hikeRating: 'Difficulté à pied',
    mtbRating: 'Difficulté VTT',
  },
  categories: {
    unknown: 'Inconnu',
    surface: {
      paved: 'Revêtu',
      cobbles: 'Pavés',
      compacted: 'Compacté',
      gravel: 'Gravier',
      ground: 'Terre',
    },
    roadType: {
      major: 'Route principale',
      minor: 'Route secondaire',
      track: 'Chemin forestier',
      path: 'Sentier',
      footway: 'Voie piétonne',
      cycleway: 'Piste cyclable',
      steps: 'Escaliers',
    },
    hikeRating: {
      t1: 'T1 – randonnée',
      t2: 'T2 – montagne',
      t3: 'T3 – montagne exigeante',
      t4: 'T4 – alpin',
      t5: 'T5 – alpin exigeant',
      t6: 'T6 – alpin difficile',
    },
  },
};

export default fr;
