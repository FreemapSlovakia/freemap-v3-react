import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const en: WeatherForecastMessages = {
  title: 'Weather forecast',
  loading: 'Loading the forecast…',
  failed: 'The forecast could not be loaded.',
  elevation: ({ elevation }) => `For ${elevation} m above sea level`,
  updated: ({ time }) => `Updated ${time}`,
  source: 'Source',
  gusts: 'gusts',
  alongRoute: 'Weather along the route',
  departure: 'Departure',
  start: 'Start',
  highest: 'Highest point',
  finish: 'Finish',
  along: ({ distance }) => `After ${distance}`,
  beyond: 'Beyond the forecast',
  locked: 'The weather along the route with premium access',
  noRoute: 'Plan a route first.',
  past: 'From this departure, the whole route is already behind. Choose a later one.',
  pickPrompt: 'Click on the map where you want the forecast.',
  otherPlace: 'Another place',
};

export default en;
