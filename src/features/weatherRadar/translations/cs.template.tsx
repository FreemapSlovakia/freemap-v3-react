import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const cs: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Přehrát',
  pause: 'Pozastavit',
  previousFrame: 'Předchozí snímek',
  nextFrame: 'Následující snímek',
  timeline: 'Časová osa animace',
  loading: 'Načítají se snímky radaru…',
  now: 'nyní',
  ago: ({ duration }) => `před ${duration}`,
  ahead: ({ duration }) => `za ${duration}`,
  forecast: 'Předpověď',
  settings: 'Nastavení radaru',
  colorScheme: 'Barevná škála',
  smooth: 'Vyhlazování',
  snow: 'Zobrazit sněžení',
  showNowcast: 'Zobrazit předpověď',
};

export default cs;
