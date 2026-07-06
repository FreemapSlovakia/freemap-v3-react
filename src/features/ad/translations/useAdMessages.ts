import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { AdMessages } from './AdMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "ad-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useAdMessages(): AdMessages | undefined {
  return useLocalMessages<AdMessages>(factory);
}
