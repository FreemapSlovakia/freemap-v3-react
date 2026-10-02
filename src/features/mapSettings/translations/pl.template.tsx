import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const pl: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Zainstaluj — oferuj tę mapę w menu map',
  uninstall:
    'Odinstaluj — mapa nie jest nigdzie oferowana, ale link nadal ją pokaże',
  installedMaps: 'Zainstalowane mapy',
  noInstalledMaps:
    'Brak zainstalowanych map. Wyszukaj w bibliotece, aby jakieś dodać.',
  searchLibrary: ({ count }) => `Szukaj wśród ${count} map`,
  moreResults: ({ count }) => `Jeszcze ${count} — zawęź wyszukiwanie`,
  preview: 'Podgląd na mapie',
  installMap: 'Zainstaluj',
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
