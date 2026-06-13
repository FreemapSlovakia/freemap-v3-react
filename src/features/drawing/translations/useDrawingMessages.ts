import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { DrawingMessages } from './DrawingMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "drawing-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useDrawingMessages(): DrawingMessages | undefined {
  return useLocalMessages<DrawingMessages>(factory);
}
