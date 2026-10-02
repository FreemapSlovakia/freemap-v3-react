import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const hu: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  installed:
    'Telepítve — az eltávolított térképet sehol nem kínálja fel, de egy hivatkozás továbbra is megjeleníti',
  overlayOpacity: 'Átlátszóság',
  showInMenu: 'Megjelenítés a menüben',
  showInToolbar: 'Megjelenítés az eszköztáron',
  keyboardShortcut: 'Gyorsbillentyű',
  saveSuccess: 'A beállítások el lettek mentve.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a beállítások mentésénél', err),
  customMapSaved: 'Az egyéni térkép mentve.',
  shadingMapHint:
    'Az árnyékolás paramétereit a térkép bekapcsolása után megjelenő panelen lehet beállítani és menteni.',
  combination: 'Térképkombináció',
  combinationSaved: 'A térképkombináció mentve.',
  updateFromCurrentMap: 'Frissítés az aktuális térképből',
  baseMap: 'Alaptérkép',
  overlays: 'Fedőrétegek',
  addOverlay: 'Fedőréteg hozzáadása…',
  noOverlays: 'Nincsenek fedőrétegek.',
  combinationTooSmall: 'Legalább két réteg szükséges.',
};

export default hu;
