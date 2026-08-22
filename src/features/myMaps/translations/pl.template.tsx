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
  loadExclMapAndPosition: 'Wczytaj bez mapy tła i pozycji',
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
  savedToOutbox: ({ name }) => (
    <>
      Mapa <i>{name}</i> została zapisana w tej przeglądarce i zostanie wysłana,
      gdy tylko pozwoli na to połączenie.
    </>
  ),
  unsent: 'Niewysłane',
  unsentTooltip:
    'Ta mapa ma zmiany zapisane w tej przeglądarce, które nie dotarły jeszcze na serwer. Zostaną wysłane automatycznie, gdy tylko pozwoli na to połączenie.',
  syncing: 'Wysyłanie…',
  syncNow: 'Wyślij niewysłane zmiany',
  outboxEmpty: 'Brak niewysłanych zmian.',
  outboxOffline: 'Brak połączenia — niewysłane zmiany czekają w kolejce.',
  outboxSynced: ({ count }) => `Wysłane zmiany w mapach: ${count}.`,
  outboxRetryLater: ({ count }) =>
    `Nie udało się wysłać zmian w mapach (${count}); nastąpi ponowna próba.`,
  outboxError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wysyłania zmian w mapach', err),
  outboxConflict: ({ name }) => (
    <>
      Mapa <i>{name}</i> została w międzyczasie zmieniona gdzie indziej, więc
      Twoich niewysłanych zmian nie można wysłać. Wybierz, co z nimi zrobić.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Nie masz już prawa zapisu do mapy <i>{name}</i>, więc Twoich niewysłanych
      zmian nie można wysłać. Wybierz, co z nimi zrobić.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      Mapa <i>{name}</i> już nie istnieje, więc Twoich niewysłanych zmian nie
      można wysłać. Wybierz, co z nimi zrobić.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      Niewysłanych zmian mapy <i>{name}</i> nie można odczytać z tej
      przeglądarki, więc nie można ich wysłać.
    </>
  ),
  outboxConflictBadge: 'Konflikt',
  outboxBlockedBadge: 'Nie można wysłać',
  outboxResolveCopy: 'Zapisz jako kopię',
  outboxResolveOverwrite: 'Nadpisz wersję na serwerze',
  outboxResolveDiscard: 'Odrzuć moje zmiany',
  outboxDiscardTitle: 'Odrzucenie niewysłanych zmian',
  outboxDiscardConfirm: (name) => (
    <>
      Odrzucić niewysłane zmiany mapy <i>{name}</i>? Istnieją tylko w tej
      przeglądarce i nie da się ich odzyskać.
    </>
  ),
  outboxCopyName: (name) => `${name} (kopia)`,
  logoutUnsentTitle: 'Niewysłane zmiany map',
  logoutUnsentWarning: ({ count }) =>
    `Liczba map ze zmianami, które nie dotarły jeszcze na serwer: ${count}. Wylogowanie je odrzuci. Wylogować mimo to?`,
};

export default pl;
