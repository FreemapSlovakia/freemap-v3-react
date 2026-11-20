import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const it: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Previsioni meteo',
  loading: 'Caricamento delle previsioni…',
  failed: 'Impossibile caricare le previsioni.',
  elevation: ({ elevation }) => `Per ${elevation} m s.l.m.`,
  updated: ({ time }) => `Aggiornamento: ${time}`,
  source: 'Fonte',
  gusts: 'raffiche',
  alongRoute: 'Meteo lungo il percorso',
  departure: 'Partenza',
  start: 'Partenza',
  highest: 'Punto più alto',
  finish: 'Arrivo',
  along: ({ distance }) => `Dopo ${distance}`,
  beyond: 'Oltre le previsioni',
  locked: 'Il meteo lungo il percorso con l’accesso premium',
  noRoute: 'Pianifichi prima un percorso.',
  past: 'Con questa partenza l’intero percorso è già passato. Ne scelga una più tarda.',
  pause: 'Pausa',
  overnight: 'Pernottamento',
  pickPrompt: 'Clicchi sulla mappa dove desidera le previsioni.',
  otherPlace: 'Un altro luogo',
};

export default it;
