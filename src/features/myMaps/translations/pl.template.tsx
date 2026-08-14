import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const pl: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Dodaj nową mapę',
  noMapFound: 'Nie znaleziono mapy',
  save: 'Zapisz',
  loginToSave: 'Zaloguj się, aby zapisać mapę w swoich mapach.',
  reload: 'Wczytaj mapę ponownie',
  reloadConfirm:
    'Odrzucić niezapisane zmiany i wczytać ponownie zapisaną mapę?',
  unsaved: 'Niezapisane zmiany',
  unsavedTooltip:
    'Mapa zawiera niezapisane zmiany, które nie są odzwierciedlone w odnośniku. Zapisz mapę, aby je zachować.',
  disconnect: 'Odłącz',
  disconnectAndClear: 'Odłącz i wyczyść',
  deleteConfirm: (name) => (
    <>
      Czy na pewno chcesz usunąć mapę <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Usunięcie mapy',
  mapCreated: ({ name }) => (
    <>
      Mapa <i>{name}</i> została zapisana w Twoich mapach.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Zmiany w mapie <i>{name}</i> zostały zapisane.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      Mapa <i>{name}</i> została usunięta z Twoich map.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wczytywania mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wczytywania map', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas usuwania mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania mapy', err),
  loadMergeModal: {
    title: 'Mapa nie jest pusta',
    message:
      'Na mapie są już wyświetlane dane. Dołączyć do nich wczytaną mapę, czy zastąpić zawartość?',
    append: 'Dołącz',
    replace: 'Zastąp',
  },
  loadInclMapAndPosition: 'Wraz z zapisaną mapą tła i pozycją',
  writers: 'Edytorzy',
  addWriter: 'Dodaj edytora',
  conflictError: 'Mapa została w międzyczasie zmodyfikowana.',
  availableOffline: 'Dostępne offline',
  availableOfflineHint:
    'Przechowuje kopię tej mapy w przeglądarce, aby można ją było otworzyć bez połączenia. Kafelki mapy podkładowej są zapisywane osobno przez Mapy offline.',
  offline: 'Offline',
  makeAllOffline: 'Udostępnij wszystkie offline',
  removeAllOffline: 'Usuń wszystkie z offline',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas zapisywania mapy offline', err),
  offlineCachedAll: ({ count }) => `Liczba map dostępnych offline: ${count}.`,
  offlineCachedPartial: ({ count, failed }) =>
    `Map zapisanych offline: ${count}, nieudanych: ${failed}.`,
};

export default pl;
