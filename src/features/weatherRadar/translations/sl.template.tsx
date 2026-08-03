import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const sl: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Predvajaj',
  pause: 'Premor',
  previousFrame: 'Prejšnja slika',
  nextFrame: 'Naslednja slika',
  timeline: 'Časovnica animacije',
  loading: 'Nalaganje radarskih slik…',
  now: 'zdaj',
  ago: ({ duration }) => `pred ${duration}`,
  ahead: ({ duration }) => `čez ${duration}`,
  forecast: 'Napoved',
  settings: 'Nastavitve radarja',
  colorScheme: 'Barvna lestvica',
  smooth: 'Glajenje',
  snow: 'Prikaži sneg',
  showNowcast: 'Prikaži napoved',
};

export default sl;
