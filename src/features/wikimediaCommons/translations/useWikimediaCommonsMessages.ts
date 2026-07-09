import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { WikimediaCommonsMessages } from './WikimediaCommonsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "wikimedia-commons-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useWikimediaCommonsMessages():
  | WikimediaCommonsMessages
  | undefined {
  return useLocalMessages<WikimediaCommonsMessages>(factory);
}
