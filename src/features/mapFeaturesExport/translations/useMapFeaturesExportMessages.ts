import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "map-features-export-translation-[request]" */
    `./${language}.tsx`
  );

export function useMapFeaturesExportMessages():
  | MapFeaturesExportMessages
  | undefined {
  return useLocalMessages<MapFeaturesExportMessages>(factory);
}
