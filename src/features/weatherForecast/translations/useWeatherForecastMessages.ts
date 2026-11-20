import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { WeatherForecastMessages } from './WeatherForecastMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "weather-forecast-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useWeatherForecastMessages():
  | WeatherForecastMessages
  | undefined {
  return useLocalMessages<WeatherForecastMessages>(factory);
}
