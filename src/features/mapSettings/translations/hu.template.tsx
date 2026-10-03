import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const hu: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Telepítés — a térkép megjelenik a térképmenükben',
  noInstalledMaps:
    'Nincs telepített térkép. Adjon hozzá néhányat az elérhető térképek közül.',
  searchLibrary: ({ count }) => `Keresés ${count} térkép között`,
  catalogCredit: 'A térképtár listájának forrása:',
  filters: {
    filterYourMaps: 'Telepített térképek szűrése',
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
    dataLayers: 'Adatrétegek',
    category: 'Kategória',
    country: 'Ország',
    anyCountry: 'Minden ország',
    includeWorldwide: 'Világtérképekkel együtt',
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
  suggestMap: (
    <>
      Tud olyan térképről, amely nálunk hiányzik? Írjon nekünk a(z){' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a> címre.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Egyéni térkép módosítása <i>{name}</i>
    </>
  ),
  modifyCombinationTitle: (name) => (
    <>
      Térképkombináció módosítása <i>{name}</i>
    </>
  ),
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
  useAsBaseMap: 'Használat alaptérképként',
  useAsOverlay: 'Használat fedvényként',
  basedOn: 'Alapja',
  wmsLayers: {
    title: 'Térképrétegek',
    reset: 'Alapértelmezett rétegek',
    saveAsCustomMap: 'Mentés saját térképként',
    search: 'Rétegek keresése',
    selectAll: 'Összes kijelölése',
    deselectAll: 'Kijelölés megszüntetése',
  },
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
