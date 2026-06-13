import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { CreditsMessages } from './CreditsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "credits-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useCreditsMessages(): CreditsMessages | undefined {
  return useLocalMessages<CreditsMessages>(factory);
}
