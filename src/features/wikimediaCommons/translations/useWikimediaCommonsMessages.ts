import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { WikimediaCommonsMessages } from './WikimediaCommonsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "wikimedia-commons-translation-[request]" */
    `./${language}.tsx`
  );

export function useWikimediaCommonsMessages():
  | WikimediaCommonsMessages
  | undefined {
  return useLocalMessages<WikimediaCommonsMessages>(factory);
}
