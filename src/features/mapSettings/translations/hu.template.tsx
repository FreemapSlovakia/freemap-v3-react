import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const hu: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Telepítés — a térkép megjelenik a térképmenükben',
  yourMaps: 'Az Ön térképei',
  noInstalledMaps:
    'Nincs telepített térkép. Keressen a térképtárban, és adjon hozzá néhányat.',
  searchLibrary: ({ count }) => `Keresés ${count} térkép között`,
  catalogCredit: 'A térképtár listájának forrása:',
  filters: {
    library: 'Térképtár',
    filterYourMaps: 'Térképei szűrése',
    kind: 'Fajta',
    builtIn: 'Beépített',
    fromLibrary: 'A térképtárból',
    custom: 'Egyéni',
    offline: 'Offline',
    combinations: 'Kombinációk',
    shownIn: 'Megjelenik',
    toolbar: 'Az eszköztáron',
    menu: 'A menüben',
    shortcut: 'Gyorsbillentyűvel',
    hidden: 'Rejtett',
    technology: 'Technológia',
    special: 'Különleges',
    category: 'Kategória',
    photo: 'Ortofotók',
    historicphoto: 'Történelmi légifotók',
    historicmap: 'Történelmi térképek',
    map: 'Térképek',
    elevation: 'Domborzat',
    other: 'Egyéb',
    coversView: 'Lefedi ezt a nézetet',
  },
  preview: 'Előnézet a térképen',
  installMap: 'Telepítés',
  uninstallMap: 'Eltávolítás',
  resetConfirm:
    'Visszaállítja az összes térkép eszköztár-, menü-, átlátszóság- és billentyűparancs-beállítását az alapértékekre? A telepített térképek telepítve maradnak.',
  downloadOffline: 'Letöltés offline használatra',
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
