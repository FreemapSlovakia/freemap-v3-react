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
    combinations: 'Kombinacje',
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
    includeWorldwide: 'Uwzględnij mapy światowe',
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
  modifyCombinationTitle: (name) => (
    <>
      Edytuj kombinację map <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Przywrócić domyślne ustawienia paska narzędzi, menu, przezroczystości i skrótów wszystkich map? Zainstalowane mapy pozostaną zainstalowane.',
  downloadOffline: 'Pobierz do użytku offline',
  keepOnMap: 'Zostaw na mapie',
  backToLibrary: 'Wróć do biblioteki',
  overlayOpacity: 'Przezroczystość',
  showInMenu: 'Pokaż w menu',
  showInToolbar: 'Pokaż na pasku narzędzi',
  keyboardShortcut: 'Skrót klawiszowy',
  saveSuccess: 'Ustawienia zostały zapisane.',
  useAsBaseMap: 'Użyj jako mapy bazowej',
  useAsOverlay: 'Użyj jako nakładki',
  basedOn: 'Na podstawie',
  turnOff: 'Wyłącz',
  wmsLayers: {
    reset: 'Domyślne warstwy',
    saveAsCustomMap: 'Zapisz jako własną mapę',
    search: 'Szukaj warstw',
    selectAll: 'Zaznacz wszystkie',
    deselectAll: 'Odznacz wszystkie',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Błąd zapisu ustawień', err),
  customMapSaved: 'Mapa niestandardowa została zapisana.',
  combinationTooSmall: 'Wymagane są co najmniej dwie warstwy.',
  shadingMapHint:
    'Parametry cieniowania ustawia się i zapisuje w panelu, który pojawia się po włączeniu tej mapy.',
  combination: 'Kombinacja map',
  combinationSaved: 'Kombinacja map została zapisana.',
  updateFromCurrentMap: 'Aktualizuj z bieżącej mapy',
  baseMap: 'Mapa podkładowa',
  baseMaps: 'Mapy podkładowe',
  overlays: 'Warstwy nakładkowe',
  addOverlay: 'Dodaj warstwę nakładkową…',
  noOverlays: 'Brak warstw nakładkowych.',
};

export default pl;
