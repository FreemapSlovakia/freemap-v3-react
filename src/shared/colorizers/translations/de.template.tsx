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
    surface: 'Belag',
    smoothness: 'Ebenheit',
    roadType: 'Wegtyp',
    trackType: 'Wegqualität',
    hikeRating: 'Wanderschwierigkeit',
    mtbRating: 'MTB-Schwierigkeit',
  },
  categories: {
    unknown: 'Unbekannt',
    surface: {
      paved: 'Befestigt',
      cobbles: 'Pflaster',
      compacted: 'Wassergebunden',
      gravel: 'Schotter',
      ground: 'Naturboden',
    },
    smoothness: {
      good: 'Gut',
      intermediate: 'Mittel',
      bad: 'Schlecht',
      veryBad: 'Sehr schlecht',
      impassable: 'Unpassierbar',
    },
    roadType: {
      major: 'Hauptstraße',
      minor: 'Nebenstraße',
      track: 'Waldweg',
      path: 'Pfad',
      footway: 'Fußweg',
      cycleway: 'Radweg',
      steps: 'Treppe',
    },
    trackType: {
      grade1: '1 – befestigt',
      grade2: '2 – überwiegend befestigt',
      grade3: '3 – gemischt',
      grade4: '4 – überwiegend weich',
      grade5: '5 – weich',
    },
    hikeRating: {
      t1: 'T1 – Wandern',
      t2: 'T2 – Bergwandern',
      t3: 'T3 – anspruchsvolles Bergwandern',
      t4: 'T4 – Alpinwandern',
      t5: 'T5 – anspruchsvolles Alpinwandern',
      t6: 'T6 – schwieriges Alpinwandern',
    },
  },
};

export default de;
