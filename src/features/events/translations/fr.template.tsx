import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const fr: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading events', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving event', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Error removing event', err),
  difficulty: {},
  form: {},
  filter: {},
  card: {},
  selection: {},
  picking: {},
  menu: {},
};

export default fr;
