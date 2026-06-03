import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { EmbedMessages } from './EmbedMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "embed-translation-[request]" */
    `./${language}.tsx`
  );

export function useEmbedMessages(): EmbedMessages | undefined {
  return useLocalMessages<EmbedMessages>(factory);
}
