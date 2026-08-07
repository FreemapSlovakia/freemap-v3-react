import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const en: WeatherRadarMessages = {
  play: 'Play',
  pause: 'Pause',
  previousFrame: 'Previous frame',
  nextFrame: 'Next frame',
  timeline: 'Animation timeline',
  loading: 'Loading radar frames…',
  now: 'now',
  ago: ({ duration }) => `${duration} ago`,
  ahead: ({ duration }) => `in ${duration}`,
  forecast: 'Forecast',
  settings: 'Radar settings',
  showNowcast: 'Show forecast',
  lockedHistory: 'More history and the forecast with premium access',
  lockedForecast: 'The forecast with premium access',
};

export default en;
