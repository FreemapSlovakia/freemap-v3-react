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
  loadMergeModal: {
    title: 'La mappa non è vuota',
    message:
      'La mappa mostra già dei contenuti. Aggiungere la mappa caricata o sostituire i contenuti?',
    append: 'Aggiungi',
    replace: 'Sostituisci',
  },
  loadExclMapAndPosition: 'Carica senza la mappa di sfondo e la posizione',
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
  savedToOutbox: ({ name }) => (
    <>
      La mappa <i>{name}</i> è stata salvata in questo browser e sarà inviata
      non appena la connessione lo consentirà.
    </>
  ),
  unsent: 'Non inviate',
  unsentTooltip:
    'Questa mappa ha modifiche salvate in questo browser che non sono ancora arrivate al server. Verranno inviate automaticamente non appena la connessione lo consentirà.',
  syncing: 'Invio in corso…',
  syncNow: 'Invia le modifiche non inviate',
  outboxEmpty: 'Nessuna modifica non inviata.',
  outboxOffline:
    'Nessuna connessione — le modifiche non inviate restano in coda.',
  outboxSynced: ({ count }) => `Modifiche alle mappe inviate: ${count}.`,
  outboxRetryLater: ({ count }) =>
    `Non è stato possibile inviare le modifiche alle mappe (${count}); si riproverà più tardi.`,
  outboxError: ({ err }) =>
    addError(
      getMessages()!,
      "Errore durante l'invio delle modifiche alle mappe",
      err,
    ),
  outboxConflict: ({ name }) => (
    <>
      La mappa <i>{name}</i> è stata modificata altrove nel frattempo, quindi le
      tue modifiche non inviate non possono essere inviate. Scegli cosa farne.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Non hai più il permesso di scrivere sulla mappa <i>{name}</i>, quindi le
      tue modifiche non inviate non possono essere inviate. Scegli cosa farne.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      La mappa <i>{name}</i> non esiste più, quindi le tue modifiche non inviate
      non possono essere inviate. Scegli cosa farne.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      Le modifiche non inviate della mappa <i>{name}</i> non possono essere
      rilette da questo browser, quindi non possono essere inviate.
    </>
  ),
  outboxConflictBadge: 'Conflitto',
  outboxBlockedBadge: 'Invio impossibile',
  outboxResolveCopy: 'Salva come copia',
  outboxResolveOverwrite: 'Sovrascrivi la versione sul server',
  outboxResolveDiscard: 'Scarta le mie modifiche',
  outboxDiscardTitle: 'Scarto delle modifiche non inviate',
  outboxDiscardConfirm: (name) => (
    <>
      Scartare le modifiche non inviate della mappa <i>{name}</i>? Esistono solo
      in questo browser e non possono essere recuperate.
    </>
  ),
  outboxCopyName: (name) => `${name} (copia)`,
  logoutUnsentTitle: 'Modifiche alle mappe non inviate',
  logoutUnsentWarning: ({ count }) =>
    `${count} mappa/e hanno modifiche che non sono ancora arrivate al server. Uscendo verranno scartate. Uscire comunque?`,
};

export default it;
