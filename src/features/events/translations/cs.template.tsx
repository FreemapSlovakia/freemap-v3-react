import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const cs: DeepPartialWithRequiredObjects<EventsMessages> = {
  title: 'Akce',
  createNew: 'Vytvořit novou akci',
  publishAsEvent: 'Publikovat jako akci',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba při načítání akcí', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba při ukládání akce', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba při mazání akce', err),
};

export default cs;
