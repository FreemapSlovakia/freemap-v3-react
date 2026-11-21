import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const cs: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Předpověď počasí',
  loading: 'Načítá se předpověď…',
  failed: 'Předpověď se nepodařilo načíst.',
  elevation: ({ elevation }) => `Pro ${elevation} m n. m.`,
  updated: ({ time }) => `Aktualizováno ${time}`,
  source: 'Zdroj',
  gusts: 'nárazy',
  alongRoute: 'Počasí podél trasy',
  start: 'Start',
  highest: 'Nejvyšší bod',
  finish: 'Cíl',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Mimo dosah předpovědi',
  noRoute: 'Nejprve naplánujte trasu.',
  past: 'Při tomto odchodu je celá trasa už za vámi. Zvolte pozdější.',
  pause: 'Přestávka',
  overnight: 'Nocleh',
  pickPrompt: 'Klikněte na mapě tam, kde chcete předpověď.',
  otherPlace: 'Jiné místo',
  outside: 'Předpověď pokrývá pouze Evropu.',
  feelsLike: ({ temperature }) => `Pocitová teplota: ${temperature}`,
  snowDepth: ({ depth }) => `${depth} sněhu`,
  snowLine: ({ elevation }) => `Sněží nad ${elevation}`,
  humidity: ({ value }) => `Vlhkost: ${value}`,
  freezingLevel: ({ elevation }) => `0 °C ve výšce ${elevation}`,
  clouds: ({ low, mid, high }) =>
    `Oblačnost: nízká ${low}, střední ${mid}, vysoká ${high}`,
  thunderRisk: ({ level }) => `Riziko bouřek: ${level}`,
  thunderLevels: { low: 'nízké', moderate: 'střední', high: 'vysoké' },
  sunshine: ({ duration }) => `Sluneční svit: ${duration}`,
  uvIndex: ({ index }) => `UV index: ${index}`,
  gustsMax: ({ speed }) => `Nárazy až ${speed}`,
  wetHours: ({ hours }) => `Srážky: ${hours}`,
  chanceMax: ({ probability }) => `pravděpodobnost až ${probability}`,
  visibility: ({ distance }) => `Dohlednost: ${distance}`,
};

export default cs;
