import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "cached-maps-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useCachedMapsMessages(): CachedMapsMessages | undefined {
  return useLocalMessages<CachedMapsMessages>(factory);
}
