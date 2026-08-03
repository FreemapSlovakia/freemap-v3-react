import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const it: DeepPartialWithRequiredObjects<WeatherRadarMessages> = {
  play: 'Riproduci',
  pause: 'Pausa',
  previousFrame: 'Fotogramma precedente',
  nextFrame: 'Fotogramma successivo',
  timeline: "Linea del tempo dell'animazione",
  loading: 'Caricamento dei fotogrammi radar…',
  now: 'adesso',
  ago: ({ duration }) => `${duration} fa`,
  ahead: ({ duration }) => `tra ${duration}`,
  forecast: 'Previsione',
  settings: 'Impostazioni del radar',
  colorScheme: 'Scala di colori',
  smooth: 'Smussatura',
  snow: 'Mostra la neve',
  showNowcast: 'Mostra la previsione',
};

export default it;
