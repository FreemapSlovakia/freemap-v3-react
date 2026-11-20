import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const sk: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Predpoveď počasia',
  loading: 'Načítava sa predpoveď…',
  failed: 'Predpoveď sa nepodarilo načítať.',
  elevation: ({ elevation }) => `Pre ${elevation} m n. m.`,
  updated: ({ time }) => `Aktualizované ${time}`,
  source: 'Zdroj',
  gusts: 'nárazy',
  alongRoute: 'Počasie pozdĺž trasy',
  departure: 'Odchod',
  start: 'Štart',
  highest: 'Najvyšší bod',
  finish: 'Cieľ',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Mimo dosahu predpovede',
  locked: 'Počasie pozdĺž trasy s prémiovým prístupom',
  noRoute: 'Najprv naplánujte trasu.',
  past: 'Pri tomto odchode je celá trasa už za vami. Zvoľte neskorší.',
  pickPrompt: 'Kliknite na mape tam, kde chcete predpoveď.',
  otherPlace: 'Iné miesto',
};

export default sk;
