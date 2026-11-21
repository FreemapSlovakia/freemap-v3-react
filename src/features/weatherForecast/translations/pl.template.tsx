import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const pl: DeepPartialWithRequiredObjects<WeatherForecastMessages> = {
  title: 'Prognoza pogody',
  loading: 'Wczytywanie prognozy…',
  failed: 'Nie udało się wczytać prognozy.',
  elevation: ({ elevation }) => `Dla ${elevation} m n.p.m.`,
  localTime: ({ difference }) => `Czas lokalny (${difference})`,
  updated: ({ time }) => `Zaktualizowano ${time}`,
  source: 'Źródło',
  gusts: 'porywy',
  alongRoute: 'Pogoda wzdłuż trasy',
  start: 'Start',
  highest: 'Najwyższy punkt',
  finish: 'Meta',
  along: ({ distance }) => `Po ${distance}`,
  beyond: 'Poza zasięgiem prognozy',
  noRoute: 'Najpierw należy zaplanować trasę.',
  past: 'Przy tym wyjściu cała trasa jest już w przeszłości. Należy wybrać późniejsze.',
  pause: 'Przerwa',
  overnight: 'Nocleg',
  pickPrompt: 'Kliknięcie na mapie wybiera miejsce prognozy.',
  otherPlace: 'Inne miejsce',
  outside: 'Prognoza obejmuje tylko Europę.',
  feelsLike: ({ temperature }) => `Odczuwalna: ${temperature}`,
  snowDepth: ({ depth }) => `${depth} śniegu`,
  snowLine: ({ elevation }) => `Śnieg powyżej ${elevation}`,
  humidity: ({ value }) => `Wilgotność: ${value}`,
  freezingLevel: ({ elevation }) => `Izoterma 0 °C na ${elevation}`,
  clouds: ({ low, mid, high }) =>
    `Chmury: niskie ${low}, średnie ${mid}, wysokie ${high}`,
  thunderRisk: ({ level }) => `Ryzyko burz: ${level}`,
  thunderLevels: {
    low: 'niskie',
    moderate: 'umiarkowane',
    high: 'wysokie',
  },
  sunshine: ({ duration }) => `Usłonecznienie: ${duration}`,
  uvIndex: ({ index }) => `Indeks UV: ${index}`,
  gustsMax: ({ speed }) => `Porywy do ${speed}`,
  wetHours: ({ hours }) => `Opady przez ${hours}`,
  chanceMax: ({ probability }) => `prawdopodobieństwo do ${probability}`,
  visibility: ({ distance }) => `Widzialność: ${distance}`,
};

export default pl;
