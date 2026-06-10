import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "offline-map-export-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useOfflineMapExportMessages():
  | OfflineMapExportMessages
  | undefined {
  return useLocalMessages<OfflineMapExportMessages>(factory);
}
