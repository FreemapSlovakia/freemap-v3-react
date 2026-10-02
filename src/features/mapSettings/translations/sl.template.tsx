import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const sl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Vidnost',
  showInMenu: 'Prikaži v meniju',
  showInToolbar: 'Prikaži v orodni vrstici',
  keyboardShortcut: 'Bližnjica na tipkovnici',
  saveSuccess: 'Nastavitve so bile shranjene.',
  customMapSaved: 'Zemljevid po meri je bil shranjen.',
  combinationTooSmall: 'Zahtevani sta vsaj dve plasti.',
  shadingMapHint:
    'Parametri senčenja se nastavijo in shranijo v plošči, ki se prikaže, ko vklopite ta zemljevid.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju nastavitev', err),
  combination: 'Kombinacija zemljevidov',
  combinationSaved: 'Kombinacija zemljevidov je bila shranjena.',
  updateFromCurrentMap: 'Posodobi iz trenutnega zemljevida',
  baseMap: 'Osnovni zemljevid',
  overlays: 'Prekrivni sloji',
  addOverlay: 'Dodaj prekrivni sloj…',
  noOverlays: 'Ni prekrivnih slojev.',
};

export default sl;
