import type { GalleryMessages } from './GalleryMessages.js';

let cache: GalleryMessages | undefined;

let cacheLang: string | undefined;

// Loads the gallery messages for a language for use outside React (the gallery
// fetch/save/delete/comment/rating processors' error and info toasts, the GPX
// picture export). React components should use `useLocalMessages` instead.
// Results are cached per language; the chunk is shared with the components'
// dynamic import.
export async function loadGalleryMessages(
  language: string,
): Promise<GalleryMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "gallery-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as GalleryMessages;
}
