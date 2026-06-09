import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { MyMapsMessages } from './MyMapsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "my-maps-translation-[request]" */
    `./${language}.tsx`
  );

export function useMyMapsMessages(): MyMapsMessages | undefined {
  return useLocalMessages<MyMapsMessages>(factory);
}
