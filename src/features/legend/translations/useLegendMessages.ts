import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { LegendMessages } from './LegendMessages.js';

export const loadLegendMessages = (
  language: string,
): Promise<{ default: LegendMessages }> =>
  import(
    /* webpackChunkName: "legend-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useLegendMessages(): LegendMessages | undefined {
  return useLocalMessages<LegendMessages>(loadLegendMessages);
}
