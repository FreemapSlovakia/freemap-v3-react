import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const de: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  installed:
    'Installiert — eine deinstallierte Karte wird nirgends angeboten, ein Link zeigt sie aber weiterhin',
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
};

export default de;
