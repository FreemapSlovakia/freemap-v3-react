import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "objects-translation-[request]" */
    `./${language}.tsx`
  );

export function useObjectsMessages(): ObjectsMessages | undefined {
  return useLocalMessages<ObjectsMessages>(factory);
}
