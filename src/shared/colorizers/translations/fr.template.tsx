import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const fr: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Colorer selon',
  legend: 'Légende',
  steepnessScale: 'Plage de pente',
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
    smoothness: 'Qualité du revêtement',
    roadType: 'Type de voie',
    trackType: 'Qualité du chemin',
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
    smoothness: {
      good: 'Bonne',
      intermediate: 'Moyenne',
      bad: 'Mauvaise',
      veryBad: 'Très mauvaise',
      impassable: 'Impraticable',
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
    trackType: {
      grade1: '1 – stabilisé',
      grade2: '2 – plutôt stabilisé',
      grade3: '3 – mixte',
      grade4: '4 – plutôt meuble',
      grade5: '5 – meuble',
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
