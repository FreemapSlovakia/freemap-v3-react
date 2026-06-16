import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { PurchasesMessages } from './PurchasesMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "purchases-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function usePurchasesMessages(): PurchasesMessages | undefined {
  return useLocalMessages<PurchasesMessages>(factory);
}
