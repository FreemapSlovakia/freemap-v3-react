import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const cs: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Nainstalovat — nabízet tuto mapu v menu map',
  uninstall:
    'Odinstalovat — mapa se nikde nenabízí, odkaz ji však stále zobrazí',
  installedMaps: 'Nainstalované mapy',
  noInstalledMaps:
    'Nejsou nainstalovány žádné mapy. Přidejte si je vyhledáním v knihovně.',
  searchLibrary: ({ count }) => `Hledat v ${count} mapách`,
  moreResults: ({ count }) => `Dalších ${count} — upřesněte hledání`,
  preview: 'Náhled na mapě',
  installMap: 'Nainstalovat',
  keepOnMap: 'Ponechat na mapě',
  backToLibrary: 'Zpět do knihovny',
  overlayOpacity: 'Viditelnost',
  showInMenu: 'Zobrazit v menu',
  showInToolbar: 'Zobrazit v liště',
  keyboardShortcut: 'Klávesová zkratka',
  saveSuccess: 'Změny byly uloženy.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při ukládání nastavení', err),
  customMapSaved: 'Vlastní mapa byla uložena.',
  combination: 'Kombinace map',
  combinationSaved: 'Kombinace map byla uložena.',
  updateFromCurrentMap: 'Aktualizovat z aktuální mapy',
  baseMap: 'Podkladová mapa',
  baseMaps: 'Podkladové mapy',
  shadingMapHint:
    'Parametry stínování se nastavují a ukládají v panelu, který se zobrazí po aktivaci této mapy.',
  overlays: 'Překryvné vrstvy',
  addOverlay: 'Přidat překryvnou vrstvu…',
  noOverlays: 'Žádné překryvné vrstvy.',
  combinationTooSmall: 'Vyžadují se minimálně dvě vrstvy.',
};

export default cs;
