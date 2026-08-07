import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const sk: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Prehrať',
  pause: 'Pozastaviť',
  previousFrame: 'Predchádzajúca snímka',
  nextFrame: 'Nasledujúca snímka',
  timeline: 'Časová os animácie',
  loading: 'Načítavajú sa snímky radaru…',
  now: 'teraz',
  ago: ({ duration }) => `pred ${duration}`,
  ahead: ({ duration }) => `o ${duration}`,
  forecast: 'Predpoveď',
  settings: 'Nastavenia radaru',
  showNowcast: 'Zobraziť predpoveď',
  lockedHistory: 'Dlhšia história a predpoveď s prémiovým prístupom',
  lockedForecast: 'Predpoveď s prémiovým prístupom',
};

export default sk;
