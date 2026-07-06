import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "open-in-external-app-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useOpenInExternalAppMessages():
  | OpenInExternalAppMessages
  | undefined {
  return useLocalMessages<OpenInExternalAppMessages>(factory);
}
