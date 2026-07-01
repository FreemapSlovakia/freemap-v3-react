import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const hu: DeepPartialWithRequiredObjects<EventsMessages> = {
  title: 'Események',
  createNew: 'Új esemény létrehozása',
  publishAsEvent: 'Közzététel eseményként',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Hiba az események betöltésekor', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Hiba az esemény mentésekor', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Hiba az esemény törlésekor', err),
};

export default hu;
