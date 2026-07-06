import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const pl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Przezroczystość',
  showInMenu: 'Pokaż w menu',
  showInToolbar: 'Pokaż na pasku narzędzi',
  saveSuccess: 'Ustawienia zostały zapisane.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Błąd zapisu ustawień', err),
  customMapSaved: 'Mapa niestandardowa została zapisana.',
};

export default pl;
