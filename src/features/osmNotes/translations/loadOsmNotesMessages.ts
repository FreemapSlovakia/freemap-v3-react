import type { OsmNotesMessages } from './OsmNotesMessages.js';

let cache: OsmNotesMessages | undefined;

let cacheLang: string | undefined;

// For the toast, which resolves its message outside React; the chunk is shared
// with `useOsmNotesMessages`.
export async function loadOsmNotesMessages(
  language: string,
): Promise<OsmNotesMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "osm-notes-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as OsmNotesMessages;
}
