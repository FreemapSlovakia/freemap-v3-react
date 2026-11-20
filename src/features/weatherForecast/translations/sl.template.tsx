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
  start: 'Začetek',
  highest: 'Najvišja točka',
  finish: 'Cilj',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Zunaj obsega napovedi',
  noRoute: 'Najprej načrtujte pot.',
  past: 'Pri tem odhodu je cela pot že za vami. Izberite poznejšega.',
  pause: 'Premor',
  overnight: 'Prenočitev',
  pickPrompt: 'Kliknite na zemljevidu tja, kjer želite napoved.',
  otherPlace: 'Drug kraj',
};

export default sl;
