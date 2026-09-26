import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const cs: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
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
  combinationHint:
    'S podkladovou mapou se chová jako podkladová mapa a zůstává aktivní, dokud nevyberete jinou; bez ní je překryvnou vrstvou, kterou zapnete nad jakoukoli podkladovou mapu. Její průhlednosti platí, dokud je aktivní.',
  updateFromCurrentMap: 'Aktualizovat z aktuální mapy',
  baseMap: 'Podkladová mapa',
  noBaseMap: 'Žádná — mapa bude fungovat jako překryvná vrstva',
  overlays: 'Překryvné vrstvy',
  addOverlay: 'Přidat překryvnou vrstvu…',
  noOverlays: 'Žádné překryvné vrstvy.',
  combinationTooSmall:
    'Kombinace potřebuje alespoň dvě vrstvy nebo jednu vrstvu parametrického stínování.',
  shading: 'Stínování',
  shadingHint:
    'Stínování změníte naživo v jeho panelu na mapě a poté v seznamu přes Aktualizovat z aktuální mapy.',
};

export default cs;
