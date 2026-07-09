import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const it: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Aggiungi nuova mappa',
  noMapFound: 'Nessuna mappa trovata',
  save: 'Salva',
  disconnect: 'Disconnetti',
  disconnectAndClear: 'Disconnetti e svuota',
  deleteConfirm: (name) => (
    <>
      Sicuro di cancellare la mappa <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Eliminazione mappa',
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
};

export default it;
