import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const it: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Errore durante il caricamento degli eventi', err),
  saveError: ({ err }) =>
    addError(getMessages()!, "Errore durante il salvataggio dell'evento", err),
  deleteError: ({ err }) =>
    addError(getMessages()!, "Errore durante l'annullamento dell'evento", err),
};

export default it;
