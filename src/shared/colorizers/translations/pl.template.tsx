import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const pl: DeepPartialWithRequiredObjects<ColorizerMessages> = {
  colorizeBy: 'Koloruj według',
  legend: 'Legenda',
  mode: {
    none: 'Nieaktywne',
    elevation: 'Wysokość',
    steepness: 'Stromość',
    speed: 'Prędkość',
    heartRate: 'Tętno',
    cadence: 'Kadencja',
    power: 'Moc',
    temperature: 'Temperatura',
    time: 'Czas',
    heading: 'Kierunek',
    battery: 'Bateria',
    gsmSignal: 'Sygnał GSM',
    surface: 'Nawierzchnia',
    roadType: 'Rodzaj drogi',
    hikeRating: 'Trudność pieszo',
    mtbRating: 'Trudność MTB',
  },
  categories: {
    unknown: 'Nieznane',
    surface: {
      paved: 'Utwardzona',
      cobbles: 'Bruk',
      compacted: 'Ubita',
      gravel: 'Żwir',
      ground: 'Gruntowa',
    },
    roadType: {
      major: 'Droga główna',
      minor: 'Droga lokalna',
      track: 'Droga leśna',
      path: 'Ścieżka',
      footway: 'Chodnik',
      cycleway: 'Droga rowerowa',
      steps: 'Schody',
    },
    hikeRating: {
      t1: 'T1 – turystyczna',
      t2: 'T2 – górska',
      t3: 'T3 – wymagająca górska',
      t4: 'T4 – alpejska',
      t5: 'T5 – wymagająca alpejska',
      t6: 'T6 – trudna alpejska',
    },
  },
};

export default pl;
