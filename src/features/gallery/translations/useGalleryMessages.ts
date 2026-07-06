import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { GalleryMessages } from './GalleryMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "gallery-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useGalleryMessages(): GalleryMessages | undefined {
  return useLocalMessages<GalleryMessages>(factory);
}
