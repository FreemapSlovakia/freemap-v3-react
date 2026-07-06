import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const de: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Deckkraft',
  showInMenu: 'Im Menü anzeigen',
  showInToolbar: 'In der Werkzeugleiste anzeigen',
  saveSuccess: 'Einstellungen wurden gespeichert.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Einstellungen', err),
  customMapSaved: 'Die benutzerdefinierte Karte wurde gespeichert.',
};

export default de;
