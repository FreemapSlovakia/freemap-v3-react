import type { WikimediaCommonsMessages } from './WikimediaCommonsMessages.js';

let cache: WikimediaCommonsMessages | undefined;

let cacheLang: string | undefined;

// Loads the Wikimedia Commons messages for a language for use outside React
// (the layer processor's toast dispatch). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadWikimediaCommonsMessages(
  language: string,
): Promise<WikimediaCommonsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "wikimedia-commons-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as WikimediaCommonsMessages;
}
