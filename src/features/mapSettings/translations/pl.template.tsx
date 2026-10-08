import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const pl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Zainstaluj — oferuj tę mapę w menu map',
  noInstalledMaps: 'Brak zainstalowanych map. Dodaj jakieś z dostępnych map.',
  searchLibrary: ({ count }) => `Szukaj wśród ${count} map`,
  catalogCredit: 'Lista map biblioteki korzysta z',
  filters: {
    filterYourMaps: 'Filtruj zainstalowane mapy',
    kind: 'Rodzaj',
    builtIn: 'Wbudowane',
    fromLibrary: 'Z biblioteki',
    custom: 'Własne',
    offline: 'Offline',
    presets: 'Ustawienia wstępne',
    shownIn: 'Widoczne',
    toolbar: 'Na pasku',
    menu: 'W menu',
    shortcut: 'Ze skrótem',
    hidden: 'Ukryte',
    technology: 'Technologia',
    dataLayers: 'Warstwy danych',
    category: 'Kategoria',
    country: 'Kraj',
    anyCountry: 'Wszystkie kraje',
    includeMultiCountry: 'Uwzględnij mapy wielu krajów',
    photo: 'Ortofotomapy',
    historicphoto: 'Zdjęcia historyczne',
    historicmap: 'Mapy historyczne',
    map: 'Mapy',
    elevation: 'Wysokości',
    other: 'Inne',
    coversView: 'Obejmuje ten widok',
  },
  preview: 'Podgląd na mapie',
  installMap: 'Zainstaluj',
  uninstallMap: 'Odinstaluj',
  suggestMap: (
    <>
      Znasz mapę, której nie mamy? Napisz do nas na{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Edytuj własną mapę <i>{name}</i>
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Edytuj ustawienie wstępne mapy <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Przywrócić domyślne ustawienia paska narzędzi, menu i skrótów wszystkich map oraz ich konfigurację (przezroczystość, warstwy, cieniowanie…)? Zainstalowane mapy pozostaną zainstalowane.',
  downloadOffline: 'Pobierz do użytku offline',
  keepOnMap: 'Zostaw na mapie',
  backToLibrary: 'Wróć do biblioteki',
  overlayOpacity: 'Przezroczystość',
  showInMenu: 'Pokaż w menu',
  showInToolbar: 'Pokaż na pasku narzędzi',
  keyboardShortcut: 'Skrót klawiszowy',
  saveSuccess: 'Ustawienia zostały zapisane.',
  wmsLayers: {
    search: 'Szukaj warstw',
    selectAll: 'Zaznacz wszystkie',
    deselectAll: 'Odznacz wszystkie',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Błąd zapisu ustawień', err),
  customMapSaved: 'Mapa niestandardowa została zapisana.',
  preset: 'Ustawienie wstępne mapy',
  presetSaved: 'Ustawienie wstępne mapy zostało zapisane.',
  newPreset: 'Nowe ustawienie wstępne mapy',
  saveAsPreset: 'Zapisz jako ustawienie wstępne',
  saveLayersAsPreset: 'Zapisz warstwy jako ustawienie wstępne',
  saveLayersAsPresetHint:
    'Nowe ustawienie wstępne z kopii map na mapie, ustawienia wstępne rozłożone.',
  leftOutOfPreset: (layers) =>
    `Ustawienie wstępne zawiera tylko mapy, więc nie obejmie: ${layers}.`,
  deleteAlsoNamed: (names) =>
    `Mapy na niej oparte również zostaną usunięte: ${names}.`,
  duplicatePreset: 'Duplikuj',
  saveAsMap: 'Zapisz jako mapę',
  namedMapHint:
    'Jej cieniowanie, warstwy WMS lub kolor ustawia się w panelu Warstwy mapy, a zmiana obowiązuje wszędzie, gdzie mapa jest używana.',
  newNamedMap: 'Nowa nazwana mapa',
  unappliedShading:
    'Zmiany cieniowania nie zostały jeszcze zastosowane: kliknij nazwę mapy, a potem Zastosuj.',
  openPreset: 'Pokaż na mapie',
  addMap: 'Dodaj mapę',
  presetEmpty: 'Brak warstw.',
  searchResults: 'Wyniki wyszukiwania',
  filterItems: 'Filtruj',
  nothingInView: 'Na tym fragmencie mapy nic nie znaleziono.',
  presetHint:
    'Jego warstwy edytuje się na mapie: otwórz ustawienie wstępne w panelu Warstwy mapy. Każda zmiana zapisuje się od razu.',
  baseMaps: 'Mapy podkładowe',
  overlays: 'Warstwy nakładkowe',
};

export default pl;
