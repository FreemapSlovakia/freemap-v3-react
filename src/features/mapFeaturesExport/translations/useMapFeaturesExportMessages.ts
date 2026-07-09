import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "map-features-export-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useMapFeaturesExportMessages():
  | MapFeaturesExportMessages
  | undefined {
  return useLocalMessages<MapFeaturesExportMessages>(factory);
}
