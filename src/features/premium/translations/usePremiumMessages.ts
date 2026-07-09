import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { PremiumMessages } from './PremiumMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "premium-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function usePremiumMessages(): PremiumMessages | undefined {
  return useLocalMessages<PremiumMessages>(factory);
}
