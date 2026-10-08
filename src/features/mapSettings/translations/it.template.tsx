import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const it: DeepPartialWithRequiredObjects<MapSettingsMessages> = {
  install: 'Installa — proponi questa mappa nei menu delle mappe',
  noInstalledMaps:
    'Nessuna mappa installata. Aggiungine dalle mappe disponibili.',
  searchLibrary: ({ count }) => `Cerca tra ${count} mappe`,
  catalogCredit: 'L’elenco delle mappe della libreria attinge da',
  filters: {
    filterYourMaps: 'Filtra le mappe installate',
    kind: 'Tipo',
    builtIn: 'Integrate',
    fromLibrary: 'Dalla libreria',
    custom: 'Personalizzate',
    offline: 'Offline',
    presets: 'Preimpostazioni',
    shownIn: 'Mostrate',
    toolbar: 'Nella barra',
    menu: 'Nel menu',
    shortcut: 'Con scorciatoia',
    hidden: 'Nascoste',
    technology: 'Tecnologia',
    dataLayers: 'Livelli di dati',
    category: 'Categoria',
    country: 'Paese',
    anyCountry: 'Tutti i paesi',
    includeMultiCountry: 'Includi mappe multinazionali',
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
  suggestMap: (
    <>
      Conosci una mappa che non abbiamo? Scrivici a{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Modifica mappa personalizzata <i>{name}</i>
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Modifica preimpostazione di mappa <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Ripristinare le impostazioni di barra degli strumenti, menu e scorciatoie di tutte le mappe e la loro configurazione (opacità, livelli, ombreggiatura…)? Le mappe installate restano installate.',
  downloadOffline: 'Scarica per l’uso offline',
  keepOnMap: 'Tieni sulla mappa',
  backToLibrary: 'Torna alla libreria',
  overlayOpacity: 'Opacità',
  showInMenu: 'Mostra nel menu',
  showInToolbar: 'Mostra nella barra degli strumenti',
  keyboardShortcut: 'Scorciatoia da tastiera',
  saveSuccess: 'Impostazioni salvate.',
  wmsLayers: {
    search: 'Cerca livelli',
    selectAll: 'Seleziona tutti',
    deselectAll: 'Deseleziona tutti',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Errore nel salvataggio delle impostazioni:', err),
  customMapSaved: 'La mappa personalizzata è stata salvata.',
  preset: 'Preimpostazione di mappa',
  presetSaved: 'La preimpostazione di mappa è stata salvata.',
  newPreset: 'Nuova preimpostazione di mappa',
  saveAsPreset: 'Salva come preimpostazione',
  saveLayersAsPreset: 'Salva i livelli come preimpostazione',
  saveLayersAsPresetHint:
    'Una nuova preimpostazione con copie delle mappe sulla mappa, le preimpostazioni scomposte.',
  leftOutOfPreset: (layers) =>
    `Una preimpostazione contiene solo mappe, quindi non includerà: ${layers}.`,
  deleteAlsoNamed: (names) =>
    `Verranno eliminate anche le mappe basate su di essa: ${names}.`,
  duplicatePreset: 'Duplica',
  saveAsMap: 'Salva come mappa',
  namedMapHint:
    "L'ombreggiatura, i livelli WMS o il colore si impostano nel pannello Livelli della mappa, e una modifica vale ovunque la mappa sia usata.",
  newNamedMap: 'Nuova mappa con nome',
  unappliedShading:
    "Modifiche all'ombreggiatura non ancora applicate: fai clic sul nome della mappa, poi su Applica.",
  openPreset: 'Mostra sulla mappa',
  addMap: 'Aggiungi mappa',
  presetEmpty: 'Nessun livello.',
  searchResults: 'Risultati della ricerca',
  filterItems: 'Filtra',
  openTool: 'Apri strumento',
  nothingInView: 'Nessun risultato in questa parte della mappa.',
  presetHint:
    'I suoi livelli si modificano sulla mappa: apri la preimpostazione nel pannello Livelli della mappa. Ogni modifica si salva subito.',
  baseMaps: 'Mappe di base',
  overlays: 'Livelli sovrapposti',
};

export default it;
