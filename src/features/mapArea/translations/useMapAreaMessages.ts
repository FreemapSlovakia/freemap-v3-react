import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { MapAreaMessages } from './MapAreaMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "map-area-translation-[request]" */
    `./${language}.tsx`
  );

export function useMapAreaMessages(): MapAreaMessages | undefined {
  return useLocalMessages<MapAreaMessages>(factory);
}
