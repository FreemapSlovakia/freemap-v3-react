import type { ObjectsMessages } from './ObjectsMessages.js';

let cache: ObjectsMessages | undefined;

let cacheLang: string | undefined;

// Loads the objects messages for a language for use outside React (the fetch
// processors' toasts and errors). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadObjectsMessages(
  language: string,
): Promise<ObjectsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "objects-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as ObjectsMessages;
}
