import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { MapDetailsMessages } from './MapDetailsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "map-details-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useMapDetailsMessages(): MapDetailsMessages | undefined {
  return useLocalMessages<MapDetailsMessages>(factory);
}
