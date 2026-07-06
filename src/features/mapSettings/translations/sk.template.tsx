import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const sk: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Viditeľnosť',
  showInMenu: 'Zobraziť v menu',
  showInToolbar: 'Zobraziť v lište',
  saveSuccess: 'Zmeny boli uložené.',
  customMapSaved: 'Vlastná mapa bola uložená.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní nastavení', err),
};

export default sk;
