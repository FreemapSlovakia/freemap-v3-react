import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const it: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Aggiungi nuova mappa',
  noMapFound: 'Nessuna mappa trovata',
  save: 'Salva',
  loginToSave: 'Accedi prima per salvare la mappa nelle tue mappe.',
  reload: 'Ricarica la mappa',
  reloadConfirm:
    'Vuoi scartare le modifiche non salvate e ricaricare la mappa salvata?',
  unsaved: 'Modifiche non salvate',
  unsavedTooltip:
    'La mappa contiene modifiche non salvate che non si riflettono nel collegamento. Salva la mappa per conservarle.',
  disconnect: 'Disconnetti',
  disconnectAndClear: 'Disconnetti e svuota',
  deleteConfirm: (name) => (
    <>
      Sicuro di cancellare la mappa <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Eliminazione mappa',
  mapCreated: ({ name }) => (
    <>
      La mappa <i>{name}</i> è stata salvata nelle tue mappe.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Le modifiche alla mappa <i>{name}</i> sono state salvate.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      La mappa <i>{name}</i> è stata eliminata dalle tue mappe.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Errore caricando la mappa:', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Errore caricando le mappe:', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Errore eliminando la mappa:', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Errore salvando la mappa:', err),
  loadToEmpty: 'Su mappa vuota',
  loadInclMapAndPosition: 'Inclusa la mappa di sfondo salvata e posizione',
  writers: 'Editori',
  addWriter: 'Aggiungi editor',
  conflictError: 'La mappa è stata modificata nel frattempo.',
  availableOffline: 'Disponibile offline',
  availableOfflineHint:
    'Conserva una copia di questa mappa nel browser, così può essere aperta anche senza connessione. I tasselli della mappa di sfondo si salvano separatamente tramite le Mappe offline.',
  offline: 'Offline',
  makeAllOffline: 'Rendi tutte disponibili offline',
  removeAllOffline: 'Rimuovi tutte dall’offline',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Errore nel salvataggio offline della mappa', err),
  offlineCachedAll: ({ count }) =>
    `${count} mappa/e ora sono disponibili offline.`,
  offlineCachedPartial: ({ count, failed }) =>
    `${count} mappa/e salvate offline, ${failed} non riuscite.`,
};

export default it;
