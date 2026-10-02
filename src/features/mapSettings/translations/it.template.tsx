import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const it: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Installa — proponi questa mappa nei menu delle mappe',
  yourMaps: 'Le tue mappe',
  noInstalledMaps:
    'Nessuna mappa installata. Cerca nella libreria per aggiungerne.',
  searchLibrary: ({ count }) => `Cerca tra ${count} mappe`,
  catalogCredit: 'L’elenco delle mappe della libreria attinge da',
  filters: {
    library: 'Libreria',
    filterYourMaps: 'Filtra le tue mappe',
    kind: 'Tipo',
    builtIn: 'Integrate',
    fromLibrary: 'Dalla libreria',
    custom: 'Personalizzate',
    offline: 'Offline',
    combinations: 'Combinazioni',
    shownIn: 'Mostrate',
    toolbar: 'Nella barra',
    menu: 'Nel menu',
    shortcut: 'Con scorciatoia',
    hidden: 'Nascoste',
    technology: 'Tecnologia',
    special: 'Speciali',
    category: 'Categoria',
    photo: 'Ortofoto',
    historicphoto: 'Immagini storiche',
    historicmap: 'Mappe storiche',
    map: 'Mappe',
    elevation: 'Altimetria',
    other: 'Altro',
    coversView: 'Coprono questa vista',
  },
  preview: 'Anteprima sulla mappa',
  installMap: 'Installa',
  uninstallMap: 'Disinstalla',
  resetConfirm:
    'Ripristinare le impostazioni di barra degli strumenti, menu, opacità e scorciatoie di tutte le mappe? Le mappe installate restano installate.',
  downloadOffline: 'Scarica per l’uso offline',
  keepOnMap: 'Tieni sulla mappa',
  backToLibrary: 'Torna alla libreria',
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
  baseMaps: 'Mappe di base',
  overlays: 'Livelli sovrapposti',
  addOverlay: 'Aggiungi livello sovrapposto…',
  noOverlays: 'Nessun livello sovrapposto.',
  combinationTooSmall: 'Sono necessari almeno due livelli.',
};

export default it;
