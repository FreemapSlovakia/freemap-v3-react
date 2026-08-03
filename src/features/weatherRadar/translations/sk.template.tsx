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
  colorScheme: 'Farebná škála',
  smooth: 'Vyhladzovanie',
  snow: 'Zobraziť sneženie',
  showNowcast: 'Zobraziť predpoveď',
};

export default sk;
