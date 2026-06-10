import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "map-to-document-export-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useMapToDocumentExportMessages():
  | MapToDocumentExportMessages
  | undefined {
  return useLocalMessages<MapToDocumentExportMessages>(factory);
}
