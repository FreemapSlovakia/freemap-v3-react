import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const pl: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Dodaj nową mapę',
  noMapFound: 'Nie znaleziono mapy',
  save: 'Zapisz',
  disconnect: 'Odłącz',
  disconnectAndClear: 'Odłącz i wyczyść',
  deleteConfirm: (name) => (
    <>
      Czy na pewno chcesz usunąć mapę <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Usunięcie mapy',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wczytywania mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wczytywania map', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas usuwania mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania mapy', err),
  loadToEmpty: 'Do pustej mapy',
  loadInclMapAndPosition: 'Wraz z zapisaną mapą tła i pozycją',
  writers: 'Edytorzy',
  addWriter: 'Dodaj edytora',
  conflictError: 'Mapa została w międzyczasie zmodyfikowana.',
};

export default pl;
