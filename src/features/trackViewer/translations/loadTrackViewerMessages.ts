import type { TrackViewerMessages } from './TrackViewerMessages.js';

let cache: TrackViewerMessages | undefined;

let cacheLang: string | undefined;

// Loads the track-viewer messages for a language for use outside React (the
// download/upload/load processors' toasts and errors). React components should
// use `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadTrackViewerMessages(
  language: string,
): Promise<TrackViewerMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "track-viewer-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as TrackViewerMessages;
}
