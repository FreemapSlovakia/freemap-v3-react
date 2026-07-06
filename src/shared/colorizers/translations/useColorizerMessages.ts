import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { ColorizerMessages } from './ColorizerMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "colorizer-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useColorizerMessages(): ColorizerMessages | undefined {
  return useLocalMessages<ColorizerMessages>(factory);
}
