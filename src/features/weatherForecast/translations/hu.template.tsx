import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const hu: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Időjárás-előrejelzés',
  loading: 'Az előrejelzés betöltése…',
  failed: 'Az előrejelzést nem sikerült betölteni.',
  elevation: ({ elevation }) => `${elevation} m tengerszint feletti magasságra`,
  updated: ({ time }) => `Frissítve: ${time}`,
  source: 'Forrás',
  gusts: 'széllökések',
  alongRoute: 'Időjárás az útvonal mentén',
  departure: 'Indulás',
  start: 'Kiindulás',
  highest: 'Legmagasabb pont',
  finish: 'Cél',
  along: ({ distance }) => `${distance} után`,
  beyond: 'Az előrejelzésen túl',
  locked: 'Az időjárás az útvonal mentén prémium hozzáféréssel',
  noRoute: 'Először tervezzen útvonalat.',
  past: 'Ezzel az indulással a teljes útvonal már a múltban van. Válasszon későbbit.',
  pickPrompt: 'Kattintson a térképen oda, ahol az előrejelzést szeretné.',
  otherPlace: 'Másik hely',
};

export default hu;
