import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const en: EventsMessages = {
  title: 'Events',
  createNew: 'Create new event',
  noEvents: 'No events found',
  filterFrom: 'From',
  filterTo: 'To',
  inMapArea: 'Only in the current map area',
  activityType: 'Activity type',
  activityTypePlaceholder: 'Any (coming soon)',
  formTitle: 'Title',
  formDescription: 'Description',
  startAt: 'Start',
  endAt: 'End',
  startPoint: 'Start point',
  takeFromRouteStart: 'Take from route start',
  visibility: 'Visibility',
  visibilityPublic: 'Public',
  visibilityUnlisted: 'Unlisted (accessible by link)',
  source: 'Map',
  sourceExisting: 'Existing saved map',
  sourceCurrent: 'Publish the current map',
  sourceCurrentName: 'New map name',
  pickMap: 'Choose a map…',
  noWritableMaps: 'You have no saved maps yet.',
  edit: 'Edit',
  delete: 'Delete',
  open: 'Open',
  deleteConfirm: (title) => `Do you really want to delete event "${title}"?`,
  publishAsEvent: 'Publish as event',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading events', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving event', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Error deleting event', err),
};

export default en;
