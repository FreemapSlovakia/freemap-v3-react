import type { TrackingMessages } from './TrackingMessages.js';

let cache: TrackingMessages | undefined;

let cacheLang: string | undefined;

// Loads the tracking messages for a language for use outside React (the
// websocket middleware's subscribe-error toasts). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadTrackingMessages(
  language: string,
): Promise<TrackingMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "tracking-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as TrackingMessages;
}
