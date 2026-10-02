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
    combinations: 'Kombinácie',
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
    includeWorldwide: 'Vrátane celosvetových máp',
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
  modifyCombinationTitle: (name) => (
    <>
      Upraviť kombináciu máp <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Vrátiť nastavenia panela nástrojov, menu, priehľadnosti a klávesových skratiek všetkých máp na predvolené? Nainštalované mapy zostanú nainštalované.',
  downloadOffline: 'Stiahnuť na použitie offline',
  keepOnMap: 'Ponechať na mape',
  backToLibrary: 'Späť do knižnice',
  overlayOpacity: 'Viditeľnosť',
  showInMenu: 'Zobraziť v menu',
  showInToolbar: 'Zobraziť v lište',
  keyboardShortcut: 'Klávesová skratka',
  saveSuccess: 'Zmeny boli uložené.',
  customMapSaved: 'Vlastná mapa bola uložená.',
  combination: 'Kombinácia máp',
  combinationSaved: 'Kombinácia máp bola uložená.',
  updateFromCurrentMap: 'Aktualizovať z aktuálnej mapy',
  baseMap: 'Podkladová mapa',
  baseMaps: 'Podkladové mapy',
  shadingMapHint:
    'Parametre tieňovania sa nastavujú a ukladajú v paneli, ktorý sa zobrazí po aktivácii tejto mapy.',
  overlays: 'Prekryvné vrstvy',
  addOverlay: 'Pridať prekryvnú vrstvu…',
  noOverlays: 'Žiadne prekryvné vrstvy.',
  combinationTooSmall: 'Vyžadujú sa minimálne dve vrstvy.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní nastavení', err),
};

export default sk;
