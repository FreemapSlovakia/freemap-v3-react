import type { PanoramaMessages } from './PanoramaMessages.js';

let cache: PanoramaMessages | undefined;

let cacheLang: string | undefined;

// Loads the panorama messages for a language for use outside React (toast
// dispatch). Components should use `usePanoramaMessages` instead. Cached per
// language; the chunk is shared with the components' dynamic import.
export async function loadPanoramaMessages(
  language: string,
): Promise<PanoramaMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "panorama-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as PanoramaMessages;
}
