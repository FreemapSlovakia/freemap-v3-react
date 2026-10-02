import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const de: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Installieren — diese Karte in den Kartenmenüs anbieten',
  noInstalledMaps:
    'Keine Karten installiert. Fügen Sie welche aus den verfügbaren Karten hinzu.',
  searchLibrary: ({ count }) => `${count} Karten durchsuchen`,
  catalogCredit: 'Die Kartenliste der Bibliothek stützt sich auf den',
  filters: {
    filterYourMaps: 'Installierte Karten filtern',
    kind: 'Art',
    builtIn: 'Eingebaut',
    fromLibrary: 'Aus der Bibliothek',
    custom: 'Benutzerdefiniert',
    offline: 'Offline',
    combinations: 'Kombinationen',
    shownIn: 'Angezeigt',
    toolbar: 'In der Werkzeugleiste',
    menu: 'Im Menü',
    shortcut: 'Mit Tastenkürzel',
    hidden: 'Verborgen',
    technology: 'Technologie',
    dataLayers: 'Datenebenen',
    category: 'Kategorie',
    photo: 'Orthofotos',
    historicphoto: 'Historische Luftbilder',
    historicmap: 'Historische Karten',
    map: 'Karten',
    elevation: 'Höhe',
    other: 'Sonstige',
    coversView: 'Deckt diese Ansicht ab',
  },
  preview: 'Vorschau auf der Karte',
  installMap: 'Installieren',
  uninstallMap: 'Deinstallieren',
  modifyCustomMapTitle: (name) => (
    <>
      Benutzerdefinierte Karte <i>{name}</i> bearbeiten
    </>
  ),
  modifyCombinationTitle: (name) => (
    <>
      Kartenkombination <i>{name}</i> bearbeiten
    </>
  ),
  resetConfirm:
    'Symbolleisten-, Menü-, Deckkraft- und Tastenkürzel-Einstellungen aller Karten auf die Standardwerte zurücksetzen? Installierte Karten bleiben installiert.',
  downloadOffline: 'Für die Offline-Nutzung herunterladen',
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
