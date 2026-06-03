import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { ContactsMessages } from './ContactsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "contacts-translation-[request]" */
    `./${language}.tsx`
  );

export function useContactsMessages(): ContactsMessages | undefined {
  return useLocalMessages<ContactsMessages>(factory);
}
