import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { ContactsMessages } from './ContactsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "contacts-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useContactsMessages(): ContactsMessages | undefined {
  return useLocalMessages<ContactsMessages>(factory);
}
