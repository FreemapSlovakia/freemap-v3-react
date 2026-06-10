import type { ChangesetsMessages } from './ChangesetsMessages.js';

let cache: ChangesetsMessages | undefined;

let cacheLang: string | undefined;

// Loads the changesets messages for a language for use outside React (the fetch
// processor's toasts and error). React components should use `useLocalMessages`
// instead. Results are cached per language; the chunk is shared with the
// components' dynamic import.
export async function loadChangesetsMessages(
  language: string,
): Promise<ChangesetsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "changesets-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as ChangesetsMessages;
}
