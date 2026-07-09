import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const de: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Neue Karte hinzufügen',
  noMapFound: 'Keine Karte gefunden',
  save: 'Speichern',
  disconnect: 'Trennen',
  disconnectAndClear: 'Trennen und leeren',
  deleteConfirm: (name) => (
    <>
      Möchten Sie die Karte <i>{name}</i> wirklich löschen?
    </>
  ),
  deleteTitle: 'Löschen der Karte',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Karte', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Karten', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Löschen der Karte', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Karte', err),
  loadToEmpty: 'In leere Karte',
  loadInclMapAndPosition: 'Mit gespeicherter Hintergrundkarte und Position',
  writers: 'Bearbeiter',
  addWriter: 'Editor hinzufügen',
  conflictError: 'Die Karte wurde inzwischen geändert.',
};

export default de;
