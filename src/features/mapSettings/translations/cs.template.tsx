import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const cs: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Viditelnost',
  showInMenu: 'Zobrazit v menu',
  showInToolbar: 'Zobrazit v liště',
  saveSuccess: 'Změny byly uloženy.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při ukládání nastavení', err),
  customMapSaved: 'Vlastní mapa byla uložena.',
};

export default cs;
