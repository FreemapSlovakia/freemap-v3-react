import type { PremiumMessages } from './PremiumMessages.js';

let cache: PremiumMessages | undefined;

let cacheLang: string | undefined;

// Loads the premium messages for a language for use outside React (the
// purchase-success and already-premium toasts). React components should use
// `useLocalMessages` instead. Results are cached per language.
export async function loadPremiumMessages(
  language: string,
): Promise<PremiumMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "premium-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as PremiumMessages;
}
