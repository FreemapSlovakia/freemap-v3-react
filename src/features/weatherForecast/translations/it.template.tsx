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
  start: 'Partenza',
  highest: 'Punto più alto',
  finish: 'Arrivo',
  along: ({ distance }) => `Dopo ${distance}`,
  beyond: 'Oltre le previsioni',
  noRoute: 'Pianifichi prima un percorso.',
  past: 'Con questa partenza l’intero percorso è già passato. Ne scelga una più tarda.',
  pause: 'Pausa',
  overnight: 'Pernottamento',
  pickPrompt: 'Clicchi sulla mappa dove desidera le previsioni.',
  otherPlace: 'Un altro luogo',
  outside: 'La previsione copre solo l’Europa.',
  feelsLike: ({ temperature }) => `Percepita: ${temperature}`,
  snowDepth: ({ depth }) => `${depth} di neve`,
  snowLine: ({ elevation }) => `Quota neve: ${elevation}`,
  humidity: ({ value }) => `Umidità: ${value}`,
  freezingLevel: ({ elevation }) => `Zero termico a ${elevation}`,
  clouds: ({ low, mid, high }) =>
    `Nubi: basse ${low}, medie ${mid}, alte ${high}`,
  thunderRisk: ({ level }) => `Rischio temporali: ${level}`,
  thunderLevels: { low: 'basso', moderate: 'moderato', high: 'alto' },
  sunshine: ({ duration }) => `Soleggiamento: ${duration}`,
  uvIndex: ({ index }) => `Indice UV: ${index}`,
  gustsMax: ({ speed }) => `Raffiche fino a ${speed}`,
  wetHours: ({ hours }) => `Precipitazioni per ${hours}`,
  chanceMax: ({ probability }) => `probabilità fino a ${probability}`,
  visibility: ({ distance }) => `Visibilità: ${distance}`,
};

export default it;
