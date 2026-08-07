import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const de: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Abspielen',
  pause: 'Pause',
  previousFrame: 'Vorheriges Bild',
  nextFrame: 'Nächstes Bild',
  timeline: 'Zeitleiste der Animation',
  loading: 'Radarbilder werden geladen…',
  now: 'jetzt',
  ago: ({ duration }) => `vor ${duration}`,
  ahead: ({ duration }) => `in ${duration}`,
  forecast: 'Vorhersage',
  settings: 'Radareinstellungen',
  showNowcast: 'Vorhersage anzeigen',
  lockedHistory: 'Längerer Verlauf und die Vorhersage mit Premium-Zugang',
  lockedForecast: 'Die Vorhersage mit Premium-Zugang',
};

export default de;
