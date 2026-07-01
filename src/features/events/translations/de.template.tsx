import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const de: DeepPartialWithRequiredObjects<EventsMessages> = {
  title: 'Veranstaltungen',
  createNew: 'Neue Veranstaltung erstellen',
  publishAsEvent: 'Als Veranstaltung veröffentlichen',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Veranstaltungen', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Veranstaltung', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Löschen der Veranstaltung', err),
};

export default de;
