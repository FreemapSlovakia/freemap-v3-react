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
  loadMergeModal: {
    title: 'Mapa není prázdná',
    message:
      'Na mapě se už něco nachází. Připojit k tomu načtenou mapu, nebo obsah nahradit?',
    append: 'Připojit',
    replace: 'Nahradit',
  },
  loadExclMapAndPosition: 'Načíst bez podkladové mapy a pozice',
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
  savedToOutbox: ({ name }) => (
    <>
      Mapa <i>{name}</i> byla uložena v tomto prohlížeči a odešle se, jakmile to
      připojení dovolí.
    </>
  ),
  unsent: 'Neodesláno',
  unsentTooltip:
    'Tato mapa má změny uložené v tomto prohlížeči, které se ještě nedostaly na server. Odešlou se automaticky, jakmile to připojení dovolí.',
  syncing: 'Odesílám…',
  syncNow: 'Odeslat neodeslané změny',
  outboxEmpty: 'Žádné neodeslané změny.',
  outboxOffline: 'Bez připojení — neodeslané změny zůstávají ve frontě.',
  outboxSynced: ({ count }) => `Odeslané změny v mapách: ${count}.`,
  outboxRetryLater: ({ count }) =>
    `Změny v mapách se nepodařilo odeslat (${count}); zkusí se to znovu později.`,
  outboxError: ({ err }) =>
    addError(getMessages()!, 'Chyba při odesílání změn map', err),
  outboxConflict: ({ name }) => (
    <>
      Mapa <i>{name}</i> byla mezitím změněna jinde, takže vaše neodeslané změny
      nelze odeslat. Vyberte, co s nimi.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Už nemáte právo zapisovat do mapy <i>{name}</i>, takže vaše neodeslané
      změny nelze odeslat. Vyberte, co s nimi.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      Mapa <i>{name}</i> už neexistuje, takže vaše neodeslané změny nelze
      odeslat. Vyberte, co s nimi.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      Neodeslané změny mapy <i>{name}</i> nelze načíst z tohoto prohlížeče,
      takže je nelze odeslat.
    </>
  ),
  outboxConflictBadge: 'Konflikt',
  outboxBlockedBadge: 'Nelze odeslat',
  outboxResolveCopy: 'Uložit jako kopii',
  outboxResolveOverwrite: 'Přepsat verzi na serveru',
  outboxResolveDiscard: 'Zahodit moje změny',
  outboxDiscardTitle: 'Zahození neodeslaných změn',
  outboxDiscardConfirm: (name) => (
    <>
      Zahodit neodeslané změny mapy <i>{name}</i>? Existují jen v tomto
      prohlížeči a nelze je obnovit.
    </>
  ),
  outboxCopyName: (name) => `${name} (kopie)`,
  logoutUnsentTitle: 'Neodeslané změny map',
  logoutUnsentWarning: ({ count }) =>
    `Počet map se změnami, které se ještě nedostaly na server: ${count}. Odhlášením se zahodí. Přesto se odhlásit?`,
};

export default cs;
