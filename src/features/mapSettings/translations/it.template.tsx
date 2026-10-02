import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const it: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  overlayOpacity: 'Opacità',
  showInMenu: 'Mostra nel menu',
  showInToolbar: 'Mostra nella barra degli strumenti',
  keyboardShortcut: 'Scorciatoia da tastiera',
  saveSuccess: 'Impostazioni salvate.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Errore nel salvataggio delle impostazioni:', err),
  customMapSaved: 'La mappa personalizzata è stata salvata.',
  shadingMapHint:
    "I parametri dell'ombreggiatura si impostano e si salvano nel pannello che compare dopo aver attivato questa mappa.",
  combination: 'Combinazione di mappe',
  combinationSaved: 'La combinazione di mappe è stata salvata.',
  updateFromCurrentMap: 'Aggiorna dalla mappa attuale',
  baseMap: 'Mappa di base',
  overlays: 'Livelli sovrapposti',
  addOverlay: 'Aggiungi livello sovrapposto…',
  noOverlays: 'Nessun livello sovrapposto.',
  combinationTooSmall: 'Sono necessari almeno due livelli.',
};

export default it;
