import type { CachedMapsMessages } from './CachedMapsMessages.js';

let cache: CachedMapsMessages | undefined;

let cacheLang: string | undefined;

// Loads the cached-maps messages for a language for use outside React (the
// tile-caching processor's success toast). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadCachedMapsMessages(
  language: string,
): Promise<CachedMapsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "cached-maps-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as CachedMapsMessages;
}
