import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "toposcope-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useToposcopeMessages(): ToposcopeMessages | undefined {
  return useLocalMessages<ToposcopeMessages>(factory);
}
