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
  colorScheme: 'Colour scheme',
  smooth: 'Smoothing',
  snow: 'Show snow',
  showNowcast: 'Show forecast',
};

export default en;
