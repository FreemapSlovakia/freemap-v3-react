import type { AuthMessages } from './AuthMessages.js';

let cache: AuthMessages | undefined;

let cacheLang: string | undefined;

// Loads the auth messages for a language for use outside React (the login /
// logout / disconnect processors' toasts and errors). React components should
// use `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadAuthMessages(
  language: string,
): Promise<AuthMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "auth-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as AuthMessages;
}
