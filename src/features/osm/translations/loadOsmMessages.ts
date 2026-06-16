import type { OsmMessages } from './OsmMessages.js';

let cache: OsmMessages | undefined;

let cacheLang: string | undefined;

// Loads the OSM messages for a language for use outside React (the node/way/
// relation load processors' error toasts). Results are cached per language.
export async function loadOsmMessages(language: string): Promise<OsmMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "osm-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as OsmMessages;
}
