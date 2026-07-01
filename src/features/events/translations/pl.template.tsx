import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const pl: DeepPartialWithRequiredObjects<EventsMessages> = {
  title: 'Wydarzenia',
  createNew: 'Utwórz nowe wydarzenie',
  publishAsEvent: 'Opublikuj jako wydarzenie',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas ładowania wydarzeń', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania wydarzenia', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas usuwania wydarzenia', err),
};

export default pl;
