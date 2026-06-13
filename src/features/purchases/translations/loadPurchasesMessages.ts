import type { PurchasesMessages } from './PurchasesMessages.js';

let cache: PurchasesMessages | undefined;

let cacheLang: string | undefined;

// Loads the purchases messages for a language for use outside React (the
// purchase processor's pending-bank-transfer toast). React components should
// use `useLocalMessages` instead. Results are cached per language.
export async function loadPurchasesMessages(
  language: string,
): Promise<PurchasesMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "purchases-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as PurchasesMessages;
}
