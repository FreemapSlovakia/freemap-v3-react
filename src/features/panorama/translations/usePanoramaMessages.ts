import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "panorama-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function usePanoramaMessages(): PanoramaMessages | undefined {
  return useLocalMessages<PanoramaMessages>(factory);
}
