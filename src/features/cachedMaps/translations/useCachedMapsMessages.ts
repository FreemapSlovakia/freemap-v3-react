import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { CachedMapsMessages } from './CachedMapsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "cached-maps-translation-[request]" */
    `./${language}.tsx`
  );

export function useCachedMapsMessages(): CachedMapsMessages | undefined {
  return useLocalMessages<CachedMapsMessages>(factory);
}
