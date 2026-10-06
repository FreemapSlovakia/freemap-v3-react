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
    presets: 'Voreinstellungen',
    shownIn: 'Angezeigt',
    toolbar: 'In der Werkzeugleiste',
    menu: 'Im Menü',
    shortcut: 'Mit Tastenkürzel',
    hidden: 'Verborgen',
    technology: 'Technologie',
    dataLayers: 'Datenebenen',
    category: 'Kategorie',
    country: 'Land',
    anyCountry: 'Alle Länder',
    includeWorldwide: 'Weltweite Karten einschließen',
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
  suggestMap: (
    <>
      Kennen Sie eine Karte, die wir nicht haben? Schreiben Sie uns an{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Benutzerdefinierte Karte <i>{name}</i> bearbeiten
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Kartenvoreinstellung <i>{name}</i> bearbeiten
    </>
  ),
  resetConfirm:
    'Symbolleisten-, Menü- und Tastenkürzel-Einstellungen aller Karten und ihre Einrichtung (Deckkraft, Ebenen, Schattierung…) auf die Standardwerte zurücksetzen? Installierte Karten bleiben installiert.',
  downloadOffline: 'Für die Offline-Nutzung herunterladen',
  keepOnMap: 'Auf der Karte lassen',
  backToLibrary: 'Zurück zur Bibliothek',
  overlayOpacity: 'Deckkraft',
  showInMenu: 'Im Menü anzeigen',
  showInToolbar: 'In der Werkzeugleiste anzeigen',
  keyboardShortcut: 'Tastenkürzel',
  saveSuccess: 'Einstellungen wurden gespeichert.',
  wmsLayers: {
    search: 'Ebenen suchen',
    selectAll: 'Alle auswählen',
    deselectAll: 'Alle abwählen',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Einstellungen', err),
  customMapSaved: 'Die benutzerdefinierte Karte wurde gespeichert.',
  preset: 'Kartenvoreinstellung',
  presetSaved: 'Die Kartenvoreinstellung wurde gespeichert.',
  newPreset: 'Neue Kartenvoreinstellung',
  saveAsPreset: 'Als Voreinstellung speichern',
  saveLayersAsPreset: 'Ebenen als Voreinstellung speichern',
  saveLayersAsPresetHint:
    'Eine neue Voreinstellung aus Kopien der Karten auf der Karte, Voreinstellungen zerlegt.',
  turnOffToSavePreset: (layers) =>
    `Eine Voreinstellung kann keine Datenebenen enthalten. Zum Speichern ausschalten: ${layers}.`,
  deleteAlsoNamed: (names) =>
    `Die darauf aufbauenden Karten werden ebenfalls gelöscht: ${names}.`,
  duplicatePreset: 'Duplizieren',
  saveAsMap: 'Als Karte speichern',
  namedMapHint:
    'Ihre Schummerung, WMS-Ebenen oder Farbe werden im Bedienfeld Kartenebenen eingestellt; eine Änderung gilt überall, wo die Karte verwendet wird.',
  newNamedMap: 'Neue benannte Karte',
  unappliedShading:
    'Schummerungsänderungen noch nicht angewendet: auf den Namen der Karte klicken, dann auf Anwenden.',
  openPreset: 'Auf der Karte zeigen',
  addMap: 'Karte hinzufügen',
  presetEmpty: 'Keine Ebenen.',
  presetHint:
    'Ihre Ebenen werden auf der Karte bearbeitet: Öffnen Sie die Voreinstellung im Bedienfeld Kartenebenen. Jede Änderung wird sofort gespeichert.',
  baseMaps: 'Grundkarten',
  overlays: 'Überlagerungsebenen',
};

export default de;
