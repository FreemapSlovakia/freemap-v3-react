import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "elevation-chart-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useElevationChartMessages():
  | ElevationChartMessages
  | undefined {
  return useLocalMessages<ElevationChartMessages>(factory);
}
