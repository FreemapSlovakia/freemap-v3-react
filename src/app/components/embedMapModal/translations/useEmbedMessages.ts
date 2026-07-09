import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { EmbedMessages } from './EmbedMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "embed-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useEmbedMessages(): EmbedMessages | undefined {
  return useLocalMessages<EmbedMessages>(factory);
}
