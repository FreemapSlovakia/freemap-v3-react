import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const pl: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Odtwórz',
  pause: 'Wstrzymaj',
  previousFrame: 'Poprzednia klatka',
  nextFrame: 'Następna klatka',
  timeline: 'Oś czasu animacji',
  loading: 'Wczytywanie klatek radaru…',
  now: 'teraz',
  ago: ({ duration }) => `${duration} temu`,
  ahead: ({ duration }) => `za ${duration}`,
  forecast: 'Prognoza',
  settings: 'Ustawienia radaru',
  colorScheme: 'Skala barw',
  smooth: 'Wygładzanie',
  snow: 'Pokaż śnieg',
  showNowcast: 'Pokaż prognozę',
};

export default pl;
