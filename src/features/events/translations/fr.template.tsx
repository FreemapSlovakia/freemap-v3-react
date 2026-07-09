import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const fr: DeepPartialWithRequiredObjects<EventsMessages> = {
  deleteConfirm: (title) => `Do you really want to delete event "${title}"?`,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading events', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving event', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Error deleting event', err),
};

export default fr;
