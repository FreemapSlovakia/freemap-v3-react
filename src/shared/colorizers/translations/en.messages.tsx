import type { ColorizerMessages } from './ColorizerMessages.js';

const en: ColorizerMessages = {
  colorizeBy: 'Colorize by',
  legend: 'Legend',
  mode: {
    none: 'Inactive',
    elevation: 'Elevation',
    steepness: 'Steepness',
    speed: 'Speed',
    heartRate: 'Heart rate',
    cadence: 'Cadence',
    power: 'Power',
    temperature: 'Temperature',
    time: 'Time',
    heading: 'Heading',
    battery: 'Battery',
    gsmSignal: 'GSM signal',
    surface: 'Surface',
    roadType: 'Road type',
    hikeRating: 'Hiking difficulty',
    mtbRating: 'MTB difficulty',
  },
  categories: {
    unknown: 'Unknown',
    surface: {
      paved: 'Paved',
      cobbles: 'Cobbles',
      compacted: 'Compacted',
      gravel: 'Gravel',
      ground: 'Ground',
    },
    roadType: {
      major: 'Main road',
      minor: 'Minor road',
      track: 'Track',
      path: 'Path',
      footway: 'Footway',
      cycleway: 'Cycleway',
      steps: 'Steps',
    },
    hikeRating: {
      t1: 'T1 – hiking',
      t2: 'T2 – mountain',
      t3: 'T3 – demanding mountain',
      t4: 'T4 – alpine',
      t5: 'T5 – demanding alpine',
      t6: 'T6 – difficult alpine',
    },
  },
};

export default en;
