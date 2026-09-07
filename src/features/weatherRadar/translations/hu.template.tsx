import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const hu: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Lejátszás',
  pause: 'Szünet',
  previousFrame: 'Előző képkocka',
  nextFrame: 'Következő képkocka',
  timeline: 'Az animáció idővonala',
  loading: 'Radarképek betöltése…',
  now: 'most',
  ago: ({ duration }) => `${duration} ezelőtt`,
  ahead: ({ duration }) => `${duration} múlva`,
  forecast: 'Előrejelzés',
  settings: 'Radarbeállítások',
  showNowcast: 'Előrejelzés megjelenítése',
  lockedHistory: 'Hosszabb előzmény és az előrejelzés prémium hozzáféréssel',
  lockedForecast: 'Az előrejelzés prémium hozzáféréssel',
};

export default hu;
