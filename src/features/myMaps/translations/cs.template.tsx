import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const cs: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Přidat novou mapu',
  noMapFound: 'Žádná mapa nenalezena',
  save: 'Uložit',
  loginToSave: 'Pro uložení mapy do vašich map se nejprve přihlaste.',
  reload: 'Znovu načíst mapu',
  reloadConfirm: 'Zahodit neuložené změny a znovu načíst uloženou mapu?',
  unsaved: 'Neuložené změny',
  unsavedTooltip:
    'Mapa má neuložené změny, které se neodrážejí v odkazu. Uložte mapu, abyste je zachovali.',
  disconnect: 'Odpojit',
  disconnectAndClear: 'Odpojit a vyčistit',
  deleteConfirm: (name) => (
    <>
      Opravdu si přejete smazat mapu <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Smazání mapy',
  mapCreated: ({ name }) => (
    <>
      Mapa <i>{name}</i> byla uložena mezi vaše mapy.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Změny v mapě <i>{name}</i> byly uloženy.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      Mapa <i>{name}</i> byla smazána z vašich map.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při nahrávání map', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při mazání mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při ukládání mapy', err),
  loadToEmpty: 'Do čisté mapy',
  loadInclMapAndPosition: 'Včetně uložené podkladové mapy a pozice',
  writers: 'Editori',
  addWriter: 'Přidat editora',
  conflictError: 'Mapa byla mezitím modifikována.',
  availableOffline: 'Dostupné offline',
  availableOfflineHint:
    'Uchová kopii této mapy v prohlížeči, aby se dala otevřít i bez připojení. Dlaždice podkladové mapy se ukládají samostatně přes Offline mapy.',
  offline: 'Offline',
  makeAllOffline: 'Zpřístupnit všechny offline',
  removeAllOffline: 'Odebrat všechny z offline',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Chyba při ukládání mapy pro offline', err),
  offlineCachedAll: ({ count }) => `Počet map dostupných offline: ${count}.`,
  offlineCachedPartial: ({ count, failed }) =>
    `Offline uložených map: ${count}, neúspěšných: ${failed}.`,
};

export default cs;
