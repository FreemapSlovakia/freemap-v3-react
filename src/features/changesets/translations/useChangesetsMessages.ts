import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "changesets-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useChangesetsMessages(): ChangesetsMessages | undefined {
  return useLocalMessages<ChangesetsMessages>(factory);
}
