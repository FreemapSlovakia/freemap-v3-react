import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const sk: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Nainštalovať — ponúkať túto mapu v menu máp',
  noInstalledMaps:
    'Nie sú nainštalované žiadne mapy. Pridajte si ich z dostupných máp.',
  searchLibrary: ({ count }) => `Hľadať v ${count} mapách`,
  catalogCredit: 'Zoznam máp knižnice čerpá z',
  filters: {
    filterYourMaps: 'Filtrovať nainštalované mapy',
    kind: 'Druh',
    builtIn: 'Vstavané',
    fromLibrary: 'Z knižnice',
    custom: 'Vlastné',
    offline: 'Offline',
    presets: 'Predvoľby',
    shownIn: 'Zobrazené',
    toolbar: 'V lište',
    menu: 'V menu',
    shortcut: 'So skratkou',
    hidden: 'Skryté',
    technology: 'Technológia',
    dataLayers: 'Dátové vrstvy',
    category: 'Kategória',
    country: 'Krajina',
    anyCountry: 'Všetky krajiny',
    includeMultiCountry: 'Vrátane nadnárodných máp',
    photo: 'Ortofotá',
    historicphoto: 'Historické snímky',
    historicmap: 'Historické mapy',
    map: 'Mapy',
    elevation: 'Výškopis',
    other: 'Ostatné',
    coversView: 'Pokrýva tento výrez',
  },
  preview: 'Ukážka na mape',
  installMap: 'Nainštalovať',
  uninstallMap: 'Odinštalovať',
  suggestMap: (
    <>
      Poznáte mapu, ktorú nemáme? Napíšte nám na{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Upraviť vlastnú mapu <i>{name}</i>
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Upraviť predvoľbu mapy <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Vrátiť nastavenia panela nástrojov, menu a klávesových skratiek všetkých máp aj ich nastavenie (viditeľnosť, vrstvy, tieňovanie…) na predvolené? Nainštalované mapy zostanú nainštalované.',
  downloadOffline: 'Stiahnuť na použitie offline',
  keepOnMap: 'Ponechať na mape',
  backToLibrary: 'Späť do knižnice',
  overlayOpacity: 'Viditeľnosť',
  showInMenu: 'Zobraziť v menu',
  showInToolbar: 'Zobraziť v lište',
  keyboardShortcut: 'Klávesová skratka',
  saveSuccess: 'Zmeny boli uložené.',
  customMapSaved: 'Vlastná mapa bola uložená.',
  preset: 'Predvoľba mapy',
  presetSaved: 'Predvoľba mapy bola uložená.',
  newPreset: 'Nová predvoľba mapy',
  saveAsPreset: 'Uložiť ako predvoľbu',
  saveLayersAsPreset: 'Uložiť vrstvy ako predvoľbu',
  saveLayersAsPresetHint:
    'Nová predvoľba z kópií máp na mape, predvoľby rozložené.',
  turnOffToSavePreset: (layers) =>
    `Predvoľba nemôže obsahovať dátové vrstvy. Na jej uloženie vypnite: ${layers}.`,
  deleteAlsoNamed: (names) =>
    `Odstránia sa aj mapy na nej postavené: ${names}.`,
  duplicatePreset: 'Duplikovať',
  saveAsMap: 'Uložiť ako mapu',
  namedMapHint:
    'Jej tieňovanie, vrstvy WMS alebo farba sa nastavujú v paneli Vrstvy mapy a zmena sa prejaví všade, kde sa mapa používa.',
  newNamedMap: 'Nová pomenovaná mapa',
  unappliedShading:
    'Zmeny tieňovania ešte nie sú aplikované: kliknite na názov mapy a potom na Použiť.',
  openPreset: 'Zobraziť na mape',
  addMap: 'Pridať mapu',
  presetEmpty: 'Žiadne vrstvy.',
  searchResults: 'Výsledky hľadania',
  presetHint:
    'Jej vrstvy sa upravujú na mape: otvorte predvoľbu v paneli Vrstvy mapy. Každá zmena sa uloží hneď.',
  baseMaps: 'Podkladové mapy',
  overlays: 'Prekryvné vrstvy',
  wmsLayers: {
    search: 'Hľadať vrstvy',
    selectAll: 'Vybrať všetky',
    deselectAll: 'Zrušiť výber všetkých',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní nastavení', err),
};

export default sk;
