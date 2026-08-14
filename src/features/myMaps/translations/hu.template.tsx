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
};

export default hu;
