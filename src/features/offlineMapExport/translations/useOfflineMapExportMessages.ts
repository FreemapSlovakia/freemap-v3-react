import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "offline-map-export-translation-[request]" */
    `./${language}.tsx`
  );

export function useOfflineMapExportMessages():
  | OfflineMapExportMessages
  | undefined {
  return useLocalMessages<OfflineMapExportMessages>(factory);
}
