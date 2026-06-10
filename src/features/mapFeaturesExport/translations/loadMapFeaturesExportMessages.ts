import type { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

let cache: MapFeaturesExportMessages | undefined;

let cacheLang: string | undefined;

// Loads the map-features-export messages for a language for use outside React
// (the export processors' toasts and error). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadMapFeaturesExportMessages(
  language: string,
): Promise<MapFeaturesExportMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "map-features-export-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as MapFeaturesExportMessages;
}
