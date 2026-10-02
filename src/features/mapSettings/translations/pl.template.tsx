import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const pl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Zainstaluj — oferuj tę mapę w menu map',
  yourMaps: 'Twoje mapy',
  noInstalledMaps:
    'Brak zainstalowanych map. Wyszukaj w bibliotece, aby jakieś dodać.',
  searchLibrary: ({ count }) => `Szukaj wśród ${count} map`,
  catalogCredit: 'Lista map biblioteki korzysta z',
  filters: {
    library: 'Biblioteka',
    filterYourMaps: 'Filtruj swoje mapy',
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
    special: 'Specjalne',
    category: 'Kategoria',
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
