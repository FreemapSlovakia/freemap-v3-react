import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const de: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Installieren — diese Karte in den Kartenmenüs anbieten',
  uninstall:
    'Deinstallieren — die Karte wird nirgends angeboten, ein Link zeigt sie aber weiterhin',
  installedMaps: 'Installierte Karten',
  noInstalledMaps:
    'Keine Karten installiert. Durchsuchen Sie die Bibliothek, um welche hinzuzufügen.',
  searchLibrary: ({ count }) => `${count} Karten durchsuchen`,
  moreResults: ({ count }) => `${count} weitere — Suche verfeinern`,
  catalogCredit: 'Die Kartenliste der Bibliothek stützt sich auf den',
  preview: 'Vorschau auf der Karte',
  installMap: 'Installieren',
  keepOnMap: 'Auf der Karte lassen',
  backToLibrary: 'Zurück zur Bibliothek',
  overlayOpacity: 'Deckkraft',
  showInMenu: 'Im Menü anzeigen',
  showInToolbar: 'In der Werkzeugleiste anzeigen',
  keyboardShortcut: 'Tastenkürzel',
  saveSuccess: 'Einstellungen wurden gespeichert.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Einstellungen', err),
  customMapSaved: 'Die benutzerdefinierte Karte wurde gespeichert.',
  shadingMapHint:
    'Die Schattierungsparameter werden in dem Bedienfeld eingestellt und gespeichert, das nach dem Aktivieren dieser Karte erscheint.',
  combination: 'Kartenkombination',
  combinationSaved: 'Die Kartenkombination wurde gespeichert.',
  updateFromCurrentMap: 'Aus der aktuellen Karte aktualisieren',
  baseMap: 'Grundkarte',
  baseMaps: 'Grundkarten',
  overlays: 'Überlagerungsebenen',
  addOverlay: 'Überlagerungsebene hinzufügen…',
  noOverlays: 'Keine Überlagerungsebenen.',
  combinationTooSmall: 'Es sind mindestens zwei Ebenen erforderlich.',
};

export default de;
