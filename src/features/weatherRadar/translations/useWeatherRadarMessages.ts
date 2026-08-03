import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { WeatherRadarMessages } from './WeatherRadarMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "weather-radar-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useWeatherRadarMessages(): WeatherRadarMessages | undefined {
  return useLocalMessages<WeatherRadarMessages>(factory);
}
