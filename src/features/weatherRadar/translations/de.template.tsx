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
  colorScheme: 'Farbskala',
  smooth: 'Glättung',
  snow: 'Schnee anzeigen',
  showNowcast: 'Vorhersage anzeigen',
};

export default de;
