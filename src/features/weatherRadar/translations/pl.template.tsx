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
  showNowcast: 'Pokaż prognozę',
  lockedHistory: 'Dłuższa historia i prognoza z dostępem premium',
  lockedForecast: 'Prognoza z dostępem premium',
};

export default pl;
