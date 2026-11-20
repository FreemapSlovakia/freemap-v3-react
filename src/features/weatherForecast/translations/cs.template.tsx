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
  departure: 'Odchod',
  start: 'Start',
  highest: 'Nejvyšší bod',
  finish: 'Cíl',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Mimo dosah předpovědi',
  locked: 'Počasí podél trasy s prémiovým přístupem',
  noRoute: 'Nejprve naplánujte trasu.',
  past: 'Při tomto odchodu je celá trasa už za vámi. Zvolte pozdější.',
  pickPrompt: 'Klikněte na mapě tam, kde chcete předpověď.',
  otherPlace: 'Jiné místo',
};

export default cs;
