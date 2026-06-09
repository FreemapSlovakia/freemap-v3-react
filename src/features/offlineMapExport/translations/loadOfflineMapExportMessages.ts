import type { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

let cache: OfflineMapExportMessages | undefined;

let cacheLang: string | undefined;

// Loads the offline-map-export messages for a language for use outside React
// (the download processor's success toast). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadOfflineMapExportMessages(
  language: string,
): Promise<OfflineMapExportMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackExclude: /\.template\./ */
        /* webpackChunkName: "offline-map-export-translation-[request]" */
        `./${language}.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as OfflineMapExportMessages;
}
