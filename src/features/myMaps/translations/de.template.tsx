import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const de: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Neue Karte hinzufügen',
  noMapFound: 'Keine Karte gefunden',
  save: 'Speichern',
  loginToSave:
    'Melden Sie sich zuerst an, um die Karte in Ihren Karten zu speichern.',
  reload: 'Karte neu laden',
  reloadConfirm:
    'Nicht gespeicherte Änderungen verwerfen und die gespeicherte Karte neu laden?',
  unsaved: 'Nicht gespeicherte Änderungen',
  unsavedTooltip:
    'Die Karte enthält nicht gespeicherte Änderungen, die sich nicht im Link widerspiegeln. Speichern Sie die Karte, um sie zu behalten.',
  disconnect: 'Trennen',
  disconnectAndClear: 'Trennen und leeren',
  deleteConfirm: (name) => (
    <>
      Möchten Sie die Karte <i>{name}</i> wirklich löschen?
    </>
  ),
  deleteTitle: 'Löschen der Karte',
  mapCreated: ({ name }) => (
    <>
      Die Karte <i>{name}</i> wurde in Ihren Karten gespeichert.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Die Änderungen an der Karte <i>{name}</i> wurden gespeichert.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      Die Karte <i>{name}</i> wurde aus Ihren Karten gelöscht.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Karte', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Karten', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Löschen der Karte', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Karte', err),
  loadMergeModal: {
    title: 'Karte ist nicht leer',
    message:
      'Auf der Karte wird bereits Inhalt angezeigt. Die geladene Karte anhängen oder den Inhalt ersetzen?',
    append: 'Anhängen',
    replace: 'Ersetzen',
  },
  loadInclMapAndPosition: 'Mit gespeicherter Hintergrundkarte und Position',
  writers: 'Bearbeiter',
  addWriter: 'Editor hinzufügen',
  conflictError: 'Die Karte wurde inzwischen geändert.',
  availableOffline: 'Offline verfügbar',
  availableOfflineHint:
    'Behält eine Kopie dieser Karte im Browser, damit sie auch ohne Verbindung geöffnet werden kann. Kacheln der Hintergrundkarte werden separat über Offline-Karten gespeichert.',
  offline: 'Offline',
  makeAllOffline: 'Alle offline verfügbar machen',
  removeAllOffline: 'Alle aus Offline entfernen',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Offline-Speichern der Karte', err),
  offlineCachedAll: ({ count }) =>
    `${count} Karte(n) sind jetzt offline verfügbar.`,
  offlineCachedPartial: ({ count, failed }) =>
    `${count} Karte(n) offline gespeichert, ${failed} fehlgeschlagen.`,
};

export default de;
