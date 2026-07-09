import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const sk: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Pridať novú mapu',
  noMapFound: 'Žiadna mapa nenájdená',
  save: 'Uložiť',
  disconnect: 'Odpojiť',
  disconnectAndClear: 'Odpojiť a vyčistiť',
  deleteConfirm: (name) => (
    <>
      Naozaj si prajete vymazať mapu <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Vymazanie mapy',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní máp', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri mazaní mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní mapy', err),
  loadToEmpty: 'Do čistej mapy',
  loadInclMapAndPosition: 'Vrátane uloženej podkladovej mapy a pozície',
  writers: 'Editori',
  addWriter: 'Pridať editora',
  conflictError: 'Mapa bola medzičasom modifikovaná.',
  availableOffline: 'Dostupné offline',
  availableOfflineHint:
    'Uchová kópiu tejto mapy v prehliadači, aby sa dala otvoriť aj bez pripojenia. Dlaždice podkladovej mapy sa ukladajú samostatne cez Offline mapy.',
  offline: 'Offline',
  makeAllOffline: 'Sprístupniť všetky offline',
  removeAllOffline: 'Odstrániť všetky z offline',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní mapy pre offline', err),
  offlineCachedAll: ({ count }) => `Počet máp dostupných offline: ${count}.`,
  offlineCachedPartial: ({ count, failed }) =>
    `Offline uložených máp: ${count}, neúspešných: ${failed}.`,
};

export default sk;
