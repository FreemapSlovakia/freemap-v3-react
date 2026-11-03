import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const en: EventsMessages = {
  noEvents: 'No events found',
  event: 'Event',
  eventHint:
    'Publishes the map as an event that others find on the Events layer and can open by its link, even when the map is not public.',
  formDescription: 'Description',
  startAt: 'Start',
  endAt: 'End',
  startPoint: 'Start point',
  takeFromRouteStart: 'Take from route start',
  pickOnMap: 'Pick on map',
  pickStartPrompt: 'Click the map where the event starts',
  visibility: 'Visibility',
  visibilityPublic: 'Public',
  visibilityUnlisted: 'Unlisted (accessible by link)',
  details: ({ event }) => <EventDetails event={event} />,
  open: 'Open',
  backToEvents: 'Back to events',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading events', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving event', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Error removing event', err),
};

export default en;
