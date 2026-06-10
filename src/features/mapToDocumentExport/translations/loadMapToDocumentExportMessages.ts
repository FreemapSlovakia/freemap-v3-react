import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

let cache: MapToDocumentExportMessages | undefined;

let cacheLang: string | undefined;

// Loads the map-to-document-export messages for a language for use outside
// React (the export modal's error toast). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadMapToDocumentExportMessages(
  language: string,
): Promise<MapToDocumentExportMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "map-to-document-export-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as MapToDocumentExportMessages;
}
