import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const pl: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Prognoza pogody',
  loading: 'Wczytywanie prognozy…',
  failed: 'Nie udało się wczytać prognozy.',
  elevation: ({ elevation }) => `Dla ${elevation} m n.p.m.`,
  updated: ({ time }) => `Zaktualizowano ${time}`,
  source: 'Źródło',
  gusts: 'porywy',
  alongRoute: 'Pogoda wzdłuż trasy',
  departure: 'Wyjście',
  start: 'Start',
  highest: 'Najwyższy punkt',
  finish: 'Meta',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Poza zasięgiem prognozy',
  locked: 'Pogoda wzdłuż trasy z dostępem premium',
  noRoute: 'Najpierw należy zaplanować trasę.',
  past: 'Przy tym wyjściu cała trasa jest już w przeszłości. Należy wybrać późniejsze.',
  pause: 'Przerwa',
  overnight: 'Nocleg',
  pickPrompt: 'Kliknięcie na mapie wybiera miejsce prognozy.',
  otherPlace: 'Inne miejsce',
};

export default pl;
