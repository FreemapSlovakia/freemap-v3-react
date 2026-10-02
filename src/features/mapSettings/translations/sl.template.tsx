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
    combinations: 'Kombinacije',
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
    includeWorldwide: 'Vključi svetovne zemljevide',
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
  modifyCombinationTitle: (name) => (
    <>
      Uredi kombinacijo zemljevidov <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Ponastaviti nastavitve orodne vrstice, menija, prosojnosti in bližnjic vseh zemljevidov na privzete? Nameščeni zemljevidi ostanejo nameščeni.',
  downloadOffline: 'Prenesi za uporabo brez povezave',
  keepOnMap: 'Obdrži na karti',
  backToLibrary: 'Nazaj v knjižnico',
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
  baseMaps: 'Osnovni zemljevidi',
  overlays: 'Prekrivni sloji',
  addOverlay: 'Dodaj prekrivni sloj…',
  noOverlays: 'Ni prekrivnih slojev.',
};

export default sl;
