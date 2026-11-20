import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const sl: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Vremenska napoved',
  loading: 'Nalaganje napovedi…',
  failed: 'Napovedi ni bilo mogoče naložiti.',
  elevation: ({ elevation }) => `Za ${elevation} m n. m.`,
  updated: ({ time }) => `Posodobljeno ${time}`,
  source: 'Vir',
  gusts: 'sunki',
  alongRoute: 'Vreme ob poti',
  departure: 'Odhod',
  start: 'Začetek',
  highest: 'Najvišja točka',
  finish: 'Cilj',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Zunaj obsega napovedi',
  locked: 'Vreme ob poti s premium dostopom',
  noRoute: 'Najprej načrtujte pot.',
  past: 'Pri tem odhodu je cela pot že za vami. Izberite poznejšega.',
};

export default sl;
