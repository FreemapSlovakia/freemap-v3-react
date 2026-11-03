import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const en: EventsMessages = {
  noEvents: 'No events found',
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading events', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving event', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'The event is saved, but not its cover image',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Error saving the new map, so the event is not saved either',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Error deleting event', err),
};

export default en;
