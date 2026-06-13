import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { DocumentsMessages } from './DocumentsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "documents-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useDocumentsMessages(): DocumentsMessages | undefined {
  return useLocalMessages<DocumentsMessages>(factory);
}
