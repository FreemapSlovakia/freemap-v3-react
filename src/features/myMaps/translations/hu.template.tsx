import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const hu: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Új térkép hozzáadása',
  noMapFound: 'Nem található térkép',
  save: 'Mentés',
  loginToSave:
    'A térkép mentéséhez a saját térképei közé előbb jelentkezzen be.',
  reload: 'Térkép újratöltése',
  reloadConfirm:
    'Elveti a nem mentett módosításokat, és újratölti a mentett térképet?',
  unsaved: 'Nem mentett módosítások',
  unsavedTooltip:
    'A térképen nem mentett módosítások vannak, amelyek nem jelennek meg a hivatkozásban. Mentse a térképet, hogy megmaradjanak.',
  disconnect: 'Leválasztás',
  disconnectAndClear: 'Lecsatlakozás és törlés',
  deleteConfirm: (name) => (
    <>
      Biztosan törli a(z) <i>{name}</i> térképet?
    </>
  ),
  deleteTitle: 'Térkép törlése',
  mapCreated: ({ name }) => (
    <>
      A(z) <i>{name}</i> térkép mentve lett a térképei közé.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      A(z) <i>{name}</i> térkép módosításai mentve lettek.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      A(z) <i>{name}</i> térkép törölve lett a térképei közül.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép betöltéskor', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térképek betöltéskor', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép törlésekor', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép mentésekor', err),
  loadMergeModal: {
    title: 'A térkép nem üres',
    message:
      'A térképen már látható tartalom. Hozzáfűzi a betöltött térképet, vagy lecseréli vele a tartalmat?',
    append: 'Hozzáfűzés',
    replace: 'Csere',
  },
  loadInclMapAndPosition: 'A mentett alaptérképpel és pozíciójával',
  writers: 'Szerkesztők',
  addWriter: 'Szerkesztő hozzáadása',
  conflictError: 'A térképet időközben módosították.',
  availableOffline: 'Elérhető offline',
  availableOfflineHint:
    'Megőrzi a térkép másolatát a böngészőben, hogy kapcsolat nélkül is megnyitható legyen. A háttértérkép csempéi külön, az Offline térképeken keresztül tárolódnak.',
  offline: 'Offline',
  makeAllOffline: 'Összes elérhetővé tétele offline',
  removeAllOffline: 'Összes eltávolítása az offline tárolóból',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Hiba a térkép offline tárolásakor', err),
  offlineCachedAll: ({ count }) => `Offline elérhető térképek száma: ${count}.`,
  offlineCachedPartial: ({ count, failed }) =>
    `Offline tárolt térképek: ${count}, sikertelen: ${failed}.`,
  savedToOutbox: ({ name }) => (
    <>
      A(z) <i>{name}</i> térkép ebbe a böngészőbe lett mentve, és amint a
      kapcsolat engedi, elküldjük.
    </>
  ),
  unsent: 'Elküldetlen',
  unsentTooltip:
    'Ennek a térképnek vannak ebben a böngészőben mentett módosításai, amelyek még nem jutottak el a kiszolgálóra. Automatikusan elküldjük őket, amint a kapcsolat engedi.',
  syncing: 'Küldés…',
  syncNow: 'Elküldetlen módosítások küldése',
  outboxEmpty: 'Nincsenek elküldetlen módosítások.',
  outboxOffline:
    'Nincs kapcsolat — az elküldetlen módosítások sorban maradnak.',
  outboxSynced: ({ count }) => `Elküldött térképmódosítások: ${count}.`,
  outboxRetryLater: ({ count }) =>
    `A térképmódosításokat nem sikerült elküldeni (${count}); a program később újrapróbálja.`,
  outboxError: ({ err }) =>
    addError(getMessages()!, 'Hiba a térképmódosítások küldésekor', err),
  outboxConflict: ({ name }) => (
    <>
      A(z) <i>{name}</i> térképet időközben máshol módosították, ezért az
      elküldetlen módosításai nem küldhetők el. Válassza ki, mi legyen velük.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Már nincs írási joga a(z) <i>{name}</i> térképhez, ezért az elküldetlen
      módosításai nem küldhetők el. Válassza ki, mi legyen velük.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      A(z) <i>{name}</i> térkép már nem létezik, ezért az elküldetlen
      módosításai nem küldhetők el. Válassza ki, mi legyen velük.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      A(z) <i>{name}</i> térkép elküldetlen módosításai nem olvashatók vissza
      ebből a böngészőből, ezért nem küldhetők el.
    </>
  ),
  outboxConflictBadge: 'Ütközés',
  outboxBlockedBadge: 'Nem küldhető el',
  outboxResolveCopy: 'Mentés másolatként',
  outboxResolveOverwrite: 'A kiszolgálón lévő változat felülírása',
  outboxResolveDiscard: 'Módosításaim elvetése',
  outboxDiscardTitle: 'Elküldetlen módosítások elvetése',
  outboxDiscardConfirm: (name) => (
    <>
      Elveti a(z) <i>{name}</i> térkép elküldetlen módosításait? Csak ebben a
      böngészőben léteznek, és nem állíthatók helyre.
    </>
  ),
  outboxCopyName: (name) => `${name} (másolat)`,
  logoutUnsentTitle: 'Elküldetlen térképmódosítások',
  logoutUnsentWarning: ({ count }) =>
    `${count} térképnek vannak módosításai, amelyek még nem jutottak el a kiszolgálóra. A kijelentkezés elveti őket. Mégis kijelentkezik?`,
};

export default hu;
