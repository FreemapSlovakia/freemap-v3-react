import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const cs: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba při načítání akcí', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba při ukládání akce', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba při rušení akce', err),
};

export default cs;
