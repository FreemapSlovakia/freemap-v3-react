import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const it: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Opacità',
  showInMenu: 'Mostra nel menu',
  showInToolbar: 'Mostra nella barra degli strumenti',
  saveSuccess: 'Impostazioni salvate.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Errore nel salvataggio delle impostazioni:', err),
  customMapSaved: 'La mappa personalizzata è stata salvata.',
};

export default it;
