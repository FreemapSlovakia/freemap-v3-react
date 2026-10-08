import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const sl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Namesti — ponujaj to karto v menijih kart',
  noInstalledMaps:
    'Nobena karta ni nameščena. Dodajte jih iz razpoložljivih kart.',
  searchLibrary: ({ count }) => `Išči med ${count} kartami`,
  catalogCredit: 'Seznam kart knjižnice temelji na',
  filters: {
    filterYourMaps: 'Filtriraj nameščene karte',
    kind: 'Vrsta',
    builtIn: 'Vgrajene',
    fromLibrary: 'Iz knjižnice',
    custom: 'Po meri',
    offline: 'Brez povezave',
    presets: 'Prednastavitve',
    shownIn: 'Prikazane',
    toolbar: 'V orodni vrstici',
    menu: 'V meniju',
    shortcut: 'Z bližnjico',
    hidden: 'Skrite',
    technology: 'Tehnologija',
    dataLayers: 'Podatkovni sloji',
    category: 'Kategorija',
    country: 'Država',
    anyCountry: 'Vse države',
    includeMultiCountry: 'Vključi večdržavne zemljevide',
    photo: 'Ortofoto',
    historicphoto: 'Zgodovinski posnetki',
    historicmap: 'Zgodovinske karte',
    map: 'Karte',
    elevation: 'Višine',
    other: 'Drugo',
    coversView: 'Pokriva ta pogled',
  },
  preview: 'Predogled na karti',
  installMap: 'Namesti',
  uninstallMap: 'Odstrani',
  suggestMap: (
    <>
      Poznate zemljevid, ki ga nimamo? Pišite nam na{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Uredi zemljevid po meri <i>{name}</i>
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Uredi prednastavitev zemljevida <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Ponastaviti nastavitve orodne vrstice, menija in bližnjic vseh zemljevidov ter njihovo nastavitev (prosojnost, sloji, senčenje…) na privzete? Nameščeni zemljevidi ostanejo nameščeni.',
  downloadOffline: 'Prenesi za uporabo brez povezave',
  keepOnMap: 'Obdrži na karti',
  backToLibrary: 'Nazaj v knjižnico',
  overlayOpacity: 'Vidnost',
  showInMenu: 'Prikaži v meniju',
  showInToolbar: 'Prikaži v orodni vrstici',
  keyboardShortcut: 'Bližnjica na tipkovnici',
  saveSuccess: 'Nastavitve so bile shranjene.',
  customMapSaved: 'Zemljevid po meri je bil shranjen.',
  wmsLayers: {
    search: 'Iskanje slojev',
    selectAll: 'Izberi vse',
    deselectAll: 'Počisti izbiro',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju nastavitev', err),
  preset: 'Prednastavitev zemljevida',
  presetSaved: 'Prednastavitev zemljevida je bila shranjena.',
  newPreset: 'Nova prednastavitev zemljevida',
  saveAsPreset: 'Shrani kot prednastavitev',
  saveLayersAsPreset: 'Shrani sloje kot prednastavitev',
  saveLayersAsPresetHint:
    'Nova prednastavitev iz kopij zemljevidov na zemljevidu, prednastavitve razstavljene.',
  leftOutOfPreset: (layers) =>
    `Prednastavitev vsebuje le zemljevide, zato ne bo vključevala: ${layers}.`,
  deleteAlsoNamed: (names) =>
    `Izbrisani bodo tudi zemljevidi, zgrajeni na njem: ${names}.`,
  duplicatePreset: 'Podvoji',
  saveAsMap: 'Shrani kot zemljevid',
  namedMapHint:
    'Njeno senčenje, sloje WMS ali barvo nastavite v plošči Sloji zemljevida, sprememba pa velja povsod, kjer je zemljevid uporabljen.',
  newNamedMap: 'Nov poimenovan zemljevid',
  unappliedShading:
    'Spremembe senčenja še niso uporabljene: kliknite ime zemljevida, nato Uporabi.',
  openPreset: 'Prikaži na zemljevidu',
  addMap: 'Dodaj zemljevid',
  presetEmpty: 'Ni slojev.',
  searchResults: 'Rezultati iskanja',
  filterItems: 'Filtriraj',
  nothingInView: 'V tem delu zemljevida ni bilo nič najdeno.',
  presetHint:
    'Njene sloje urejate na zemljevidu: odprite prednastavitev v plošči Sloji zemljevida. Vsaka sprememba se shrani takoj.',
  baseMaps: 'Osnovni zemljevidi',
  overlays: 'Prekrivni sloji',
};

export default sl;
