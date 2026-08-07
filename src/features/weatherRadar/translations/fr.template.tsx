import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const fr: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Lire',
  pause: 'Pause',
  previousFrame: 'Image précédente',
  nextFrame: 'Image suivante',
  timeline: "Chronologie de l'animation",
  loading: 'Chargement des images radar…',
  now: 'maintenant',
  ago: ({ duration }) => `il y a ${duration}`,
  ahead: ({ duration }) => `dans ${duration}`,
  forecast: 'Prévision',
  settings: 'Paramètres du radar',
  showNowcast: 'Afficher la prévision',
  lockedHistory: 'Un historique plus long et la prévision avec l’accès premium',
  lockedForecast: 'La prévision avec l’accès premium',
};

export default fr;
