import type { DrawingMessages } from './DrawingMessages.js';

let cache: DrawingMessages | undefined;

let cacheLang: string | undefined;

// Loads the drawing messages for a language for use outside React (toast/error
// dispatch). React components should use `useLocalMessages` instead. Results are
// cached per language; the chunk is shared with the components' dynamic import.
export async function loadDrawingMessages(
  language: string,
): Promise<DrawingMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "drawing-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as DrawingMessages;
}
