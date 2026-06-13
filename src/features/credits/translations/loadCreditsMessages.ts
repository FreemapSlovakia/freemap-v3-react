import type { CreditsMessages } from './CreditsMessages.js';

let cache: CreditsMessages | undefined;

let cacheLang: string | undefined;

// Loads the credits messages for a language for use outside React (the purchase
// processor's success toast). React components should use `useLocalMessages`
// instead. Results are cached per language; the chunk is shared with the
// components' dynamic import.
export async function loadCreditsMessages(
  language: string,
): Promise<CreditsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "credits-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as CreditsMessages;
}
