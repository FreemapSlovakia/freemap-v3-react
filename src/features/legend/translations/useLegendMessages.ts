import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { LegendMessages } from './LegendMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "legend-translation-[request]" */
    `./${language}.tsx`
  );

export function useLegendMessages(): LegendMessages | undefined {
  return useLocalMessages<LegendMessages>(factory);
}
