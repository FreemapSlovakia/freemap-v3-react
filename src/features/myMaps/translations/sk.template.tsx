import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MyMapsMessages } from './MyMapsMessages.js';

const sk: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Pridať novú mapu',
  noMapFound: 'Žiadna mapa nenájdená',
  save: 'Uložiť',
  disconnect: 'Odpojiť',
  disconnectAndClear: 'Odpojiť a vyčistiť',
  deleteConfirm: (name) => (
    <>
      Naozaj si prajete vymazať mapu <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Vymazanie mapy',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní máp', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri mazaní mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní mapy', err),
  loadToEmpty: 'Do čistej mapy',
  loadInclMapAndPosition: 'Vrátane uloženej podkladovej mapy a pozície',
  writers: 'Editori',
  addWriter: 'Pridať editora',
  conflictError: 'Mapa bola medzičasom modifikovaná.',
};

export default sk;
