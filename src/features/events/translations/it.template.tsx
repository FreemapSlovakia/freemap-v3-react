import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const it: DeepPartialWithRequiredObjects<EventsMessages> = {
  title: 'Eventi',
  createNew: 'Crea un nuovo evento',
  publishAsEvent: 'Pubblica come evento',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Errore durante il caricamento degli eventi', err),
  saveError: ({ err }) =>
    addError(getMessages()!, "Errore durante il salvataggio dell'evento", err),
  deleteError: ({ err }) =>
    addError(getMessages()!, "Errore durante l'eliminazione dell'evento", err),
};

export default it;
