import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const cs: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Nainstalovat — nabízet tuto mapu v menu map',
  noInstalledMaps:
    'Nejsou nainstalovány žádné mapy. Přidejte si je z dostupných map.',
  searchLibrary: ({ count }) => `Hledat v ${count} mapách`,
  catalogCredit: 'Seznam map knihovny čerpá z',
  filters: {
    filterYourMaps: 'Filtrovat nainstalované mapy',
    kind: 'Druh',
    builtIn: 'Vestavěné',
    fromLibrary: 'Z knihovny',
    custom: 'Vlastní',
    offline: 'Offline',
    presets: 'Předvolby',
    shownIn: 'Zobrazené',
    toolbar: 'V liště',
    menu: 'V menu',
    shortcut: 'Se zkratkou',
    hidden: 'Skryté',
    technology: 'Technologie',
    dataLayers: 'Datové vrstvy',
    category: 'Kategorie',
    country: 'Země',
    anyCountry: 'Všechny země',
    includeMultiCountry: 'Včetně nadnárodních map',
    photo: 'Ortofota',
    historicphoto: 'Historické snímky',
    historicmap: 'Historické mapy',
    map: 'Mapy',
    elevation: 'Výškopis',
    other: 'Ostatní',
    coversView: 'Pokrývá tento výřez',
  },
  preview: 'Náhled na mapě',
  installMap: 'Nainstalovat',
  uninstallMap: 'Odinstalovat',
  suggestMap: (
    <>
      Znáte mapu, kterou nemáme? Napište nám na{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Upravit vlastní mapu <i>{name}</i>
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Upravit předvolbu mapy <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Vrátit nastavení panelu nástrojů, nabídky a klávesových zkratek všech map i jejich nastavení (viditelnost, vrstvy, stínování…) na výchozí? Nainstalované mapy zůstanou nainstalované.',
  downloadOffline: 'Stáhnout pro použití offline',
  keepOnMap: 'Ponechat na mapě',
  backToLibrary: 'Zpět do knihovny',
  overlayOpacity: 'Viditelnost',
  showInMenu: 'Zobrazit v menu',
  showInToolbar: 'Zobrazit v liště',
  keyboardShortcut: 'Klávesová zkratka',
  saveSuccess: 'Změny byly uloženy.',
  wmsLayers: {
    search: 'Hledat vrstvy',
    selectAll: 'Vybrat vše',
    deselectAll: 'Zrušit výběr všech',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při ukládání nastavení', err),
  customMapSaved: 'Vlastní mapa byla uložena.',
  preset: 'Předvolba mapy',
  presetSaved: 'Předvolba mapy byla uložena.',
  newPreset: 'Nová předvolba mapy',
  saveAsPreset: 'Uložit jako předvolbu',
  saveLayersAsPreset: 'Uložit vrstvy jako předvolbu',
  saveLayersAsPresetHint:
    'Nová předvolba z kopií map na mapě, předvolby rozložené.',
  turnOffToSavePreset: (layers) =>
    `Předvolba nemůže obsahovat datové vrstvy. Pro její uložení vypněte: ${layers}.`,
  deleteAlsoNamed: (names) => `Smažou se i mapy na ní postavené: ${names}.`,
  duplicatePreset: 'Duplikovat',
  saveAsMap: 'Uložit jako mapu',
  namedMapHint:
    'Její stínování, vrstvy WMS nebo barva se nastavují v panelu Vrstvy mapy a změna se projeví všude, kde se mapa používá.',
  newNamedMap: 'Nová pojmenovaná mapa',
  unappliedShading:
    'Změny stínování ještě nejsou aplikovány: klikněte na název mapy a potom na Použít.',
  openPreset: 'Zobrazit na mapě',
  addMap: 'Přidat mapu',
  presetEmpty: 'Žádné vrstvy.',
  presetHint:
    'Její vrstvy se upravují na mapě: otevřete předvolbu v panelu Vrstvy mapy. Každá změna se uloží hned.',
  baseMaps: 'Podkladové mapy',
  overlays: 'Překryvné vrstvy',
};

export default cs;
