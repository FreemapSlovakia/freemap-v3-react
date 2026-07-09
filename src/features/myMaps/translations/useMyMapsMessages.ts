import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "my-maps-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useMyMapsMessages(): MyMapsMessages | undefined {
  return useLocalMessages<MyMapsMessages>(factory);
}
