import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "data-viewer-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useDataViewerMessages(): DataViewerMessages | undefined {
  return useLocalMessages<DataViewerMessages>(factory);
}
