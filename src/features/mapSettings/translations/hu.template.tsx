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
    presets: 'Előbeállítások',
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
    includeMultiCountry: 'Több országot lefedő térképekkel együtt',
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
  modifyPresetTitle: (name) => (
    <>
      Térkép-előbeállítás módosítása <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Visszaállítja az összes térkép eszköztár-, menü- és billentyűparancs-beállítását, valamint a beállításait (átlátszóság, rétegek, árnyékolás…) az alapértékekre? A telepített térképek telepítve maradnak.',
  downloadOffline: 'Letöltés offline használatra',
  keepOnMap: 'Maradjon a térképen',
  backToLibrary: 'Vissza a térképtárba',
  overlayOpacity: 'Átlátszóság',
  showInMenu: 'Megjelenítés a menüben',
  showInToolbar: 'Megjelenítés az eszköztáron',
  keyboardShortcut: 'Gyorsbillentyű',
  saveSuccess: 'A beállítások el lettek mentve.',
  wmsLayers: {
    search: 'Rétegek keresése',
    selectAll: 'Összes kijelölése',
    deselectAll: 'Kijelölés megszüntetése',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a beállítások mentésénél', err),
  customMapSaved: 'Az egyéni térkép mentve.',
  preset: 'Térkép-előbeállítás',
  presetSaved: 'A térkép-előbeállítás mentve.',
  newPreset: 'Új térkép-előbeállítás',
  saveAsPreset: 'Mentés előbeállításként',
  saveLayersAsPreset: 'Rétegek mentése előbeállításként',
  saveLayersAsPresetHint:
    'Új előbeállítás a térképen lévő térképek másolataiból, az előbeállításokat szétszedve.',
  turnOffToSavePreset: (layers) =>
    `Egy előbeállítás nem tartalmazhat adatrétegeket. A mentéshez kapcsold ki: ${layers}.`,
  deleteAlsoNamed: (names) => `Az erre épülő térképek is törlődnek: ${names}.`,
  duplicatePreset: 'Másolat',
  saveAsMap: 'Mentés térképként',
  namedMapHint:
    'Az árnyékolását, WMS-rétegeit vagy színét a Térképrétegek panelen lehet beállítani, és a változás mindenhol érvényes, ahol a térképet használja.',
  newNamedMap: 'Új elnevezett térkép',
  unappliedShading:
    'Az árnyékolás változásai még nincsenek alkalmazva: kattintson a térkép nevére, majd az Alkalmaz gombra.',
  openPreset: 'Megjelenítés a térképen',
  addMap: 'Térkép hozzáadása',
  presetEmpty: 'Nincsenek rétegek.',
  presetHint:
    'A rétegeit a térképen lehet szerkeszteni: nyissa meg az előbeállítást a Térképrétegek panelen. Minden változás azonnal mentődik.',
  baseMaps: 'Alaptérképek',
  overlays: 'Fedőrétegek',
};

export default hu;
