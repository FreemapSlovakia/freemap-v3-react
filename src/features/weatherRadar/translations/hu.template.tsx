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
  colorScheme: 'Színskála',
  smooth: 'Simítás',
  snow: 'Hó megjelenítése',
  showNowcast: 'Előrejelzés megjelenítése',
};

export default hu;
