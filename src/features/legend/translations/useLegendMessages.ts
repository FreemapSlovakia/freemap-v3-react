import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { LegendMessages } from './LegendMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "legend-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useLegendMessages(): LegendMessages | undefined {
  return useLocalMessages<LegendMessages>(factory);
}
