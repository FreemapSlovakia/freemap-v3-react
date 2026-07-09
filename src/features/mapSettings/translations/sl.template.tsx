import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const sl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Vidnost',
  showInMenu: 'Prikaži v meniju',
  showInToolbar: 'Prikaži v orodni vrstici',
  saveSuccess: 'Nastavitve so bile shranjene.',
  customMapSaved: 'Zemljevid po meri je bil shranjen.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju nastavitev', err),
};

export default sl;
