import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { AuthMessages } from './AuthMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "auth-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useAuthMessages(): AuthMessages | undefined {
  return useLocalMessages<AuthMessages>(factory);
}
