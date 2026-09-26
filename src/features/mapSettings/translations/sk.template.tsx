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
  combinationHint:
    'S podkladovou mapou sa správa ako podkladová mapa a ostáva aktívna, kým nevyberiete inú; bez nej je prekryvnou vrstvou, ktorú zapnete nad akúkoľvek podkladovú mapu. Jej priehľadnosti platia, kým je aktívna.',
  updateFromCurrentMap: 'Aktualizovať z aktuálnej mapy',
  baseMap: 'Podkladová mapa',
  noBaseMap: 'Žiadna — mapa bude fungovať ako prekryvná vrstva',
  overlays: 'Prekryvné vrstvy',
  addOverlay: 'Pridať prekryvnú vrstvu…',
  noOverlays: 'Žiadne prekryvné vrstvy.',
  combinationTooSmall:
    'Kombinácia potrebuje aspoň dve vrstvy alebo jednu vrstvu parametrického tieňovania.',
  shading: 'Tieňovanie',
  shadingHint:
    'Tieňovanie zmeníte naživo v jeho paneli na mape a potom v zozname cez Aktualizovať z aktuálnej mapy.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní nastavení', err),
};

export default sk;
