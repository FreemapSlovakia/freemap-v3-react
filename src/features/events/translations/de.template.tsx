import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const de: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Veranstaltungen', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Veranstaltung', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Aufheben der Veranstaltung', err),
  difficulty: {},
  form: {},
  filter: {},
  card: {},
  selection: {},
  picking: {},
  menu: {},
};

export default de;
