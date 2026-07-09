import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { MapAreaMessages } from './MapAreaMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "map-area-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useMapAreaMessages(): MapAreaMessages | undefined {
  return useLocalMessages<MapAreaMessages>(factory);
}
