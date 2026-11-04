import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const pl: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas ładowania wydarzeń', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania wydarzenia', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wycofywania wydarzenia', err),
  difficulty: {},
  form: {},
  filter: {},
  card: {},
  selection: {},
  picking: {},
  menu: {},
  colorize: { modes: {}, mine: {} },
};

export default pl;
