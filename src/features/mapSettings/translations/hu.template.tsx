import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const hu: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Telepítés — a térkép megjelenik a térképmenükben',
  uninstall:
    'Eltávolítás — a térképet sehol nem kínálja fel, de egy hivatkozás továbbra is megjeleníti',
  installedMaps: 'Telepített térképek',
  noInstalledMaps:
    'Nincs telepített térkép. Keressen a térképtárban, és adjon hozzá néhányat.',
  searchLibrary: ({ count }) => `Keresés ${count} térkép között`,
  moreResults: ({ count }) => `További ${count} — pontosítsa a keresést`,
  catalogCredit: 'A térképtár listájának forrása:',
  preview: 'Előnézet a térképen',
  installMap: 'Telepítés',
  keepOnMap: 'Maradjon a térképen',
  backToLibrary: 'Vissza a térképtárba',
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
  baseMaps: 'Alaptérképek',
  overlays: 'Fedőrétegek',
  addOverlay: 'Fedőréteg hozzáadása…',
  noOverlays: 'Nincsenek fedőrétegek.',
  combinationTooSmall: 'Legalább két réteg szükséges.',
};

export default hu;
