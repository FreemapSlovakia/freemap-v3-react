import type { DataViewerMessages } from './DataViewerMessages.js';

let cache: DataViewerMessages | undefined;

let cacheLang: string | undefined;

// Loads the track-viewer messages for a language for use outside React (the
// download/upload/load processors' toasts and errors). React components should
// use `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadDataViewerMessages(
  language: string,
): Promise<DataViewerMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "data-viewer-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as DataViewerMessages;
}
