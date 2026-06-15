import type { MapDetailsMessages } from './MapDetailsMessages.js';

let cache: MapDetailsMessages | undefined;

let cacheLang: string | undefined;

// Loads the map-details messages for a language for use outside React (the
// nothing-found toast from the map-details processor). Results are cached per
// language.
export async function loadMapDetailsMessages(
  language: string,
): Promise<MapDetailsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "map-details-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as MapDetailsMessages;
}
