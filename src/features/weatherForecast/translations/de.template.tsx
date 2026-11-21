import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const de: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Wettervorhersage',
  loading: 'Vorhersage wird geladen…',
  failed: 'Die Vorhersage konnte nicht geladen werden.',
  elevation: ({ elevation }) => `Für ${elevation} m ü. M.`,
  updated: ({ time }) => `Aktualisiert ${time}`,
  source: 'Quelle',
  gusts: 'Böen',
  alongRoute: 'Wetter entlang der Route',
  start: 'Start',
  highest: 'Höchster Punkt',
  finish: 'Ziel',
  along: ({ distance }) => `Nach ${distance}`,
  beyond: 'Außerhalb der Vorhersage',
  noRoute: 'Planen Sie zuerst eine Route.',
  past: 'Bei dieser Abfahrt liegt die ganze Route schon hinter Ihnen. Wählen Sie eine spätere.',
  pause: 'Pause',
  overnight: 'Übernachtung',
  pickPrompt:
    'Klicken Sie auf der Karte dorthin, wo Sie die Vorhersage möchten.',
  otherPlace: 'Anderer Ort',
  outside: 'Die Vorhersage deckt nur Europa ab.',
  feelsLike: ({ temperature }) => `Gefühlt ${temperature}`,
  snowDepth: ({ depth }) => `${depth} Schnee`,
  snowLine: ({ elevation }) => `Schneefallgrenze: ${elevation}`,
  humidity: ({ value }) => `Luftfeuchte: ${value}`,
  freezingLevel: ({ elevation }) => `Nullgradgrenze: ${elevation}`,
  clouds: ({ low, mid, high }) =>
    `Wolken: tief ${low}, mittel ${mid}, hoch ${high}`,
  thunderRisk: ({ level }) => `Gewitterrisiko: ${level}`,
  thunderLevels: { low: 'gering', moderate: 'mäßig', high: 'hoch' },
  sunshine: ({ duration }) => `Sonnenschein: ${duration}`,
  uvIndex: ({ index }) => `UV-Index: ${index}`,
  gustsMax: ({ speed }) => `Böen bis ${speed}`,
  wetHours: ({ hours }) => `Niederschlag: ${hours}`,
  chanceMax: ({ probability }) => `Wahrscheinlichkeit bis ${probability}`,
  visibility: ({ distance }) => `Sichtweite: ${distance}`,
};

export default de;
