import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { ShadingMessages } from './ShadingMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "parameterized-shading-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useShadingMessages(): ShadingMessages | undefined {
  return useLocalMessages<ShadingMessages>(factory);
}
