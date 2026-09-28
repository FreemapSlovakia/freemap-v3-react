import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const sk: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
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
  shadingSource: 'Zdroj terénu',
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
