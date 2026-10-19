import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

const it: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Error exporting map:', err),
  cancelExportTitle: 'Annulla esportazione',
  labelTitle: 'Etichette',
  cancelExportQuestion: "Vuoi davvero annullare l'esportazione in corso?",
  discardExportTitle: 'Scarta l’esportazione',
  discardExportQuestion:
    'La mappa esportata non è ancora stata salvata. Vuoi scartarla?',
  area: 'Esporta area',
  format: 'Formato',
  layersTitle: 'Livelli opzionali',
  mapDataTitle: 'Dati mappa',
  mapTitle: 'Mappa',
  layers: {
    contours: 'Curve di livello',
    shading: 'Rilievi ombreggiati',
    hikingTrails: 'Percorsi escursionistici',
    bicycleTrails: 'Percorsi ciclistici',
    skiTrails: 'Percorsi sciistici',
    horseTrails: 'Percorsi a cavallo',
    sacScale: 'Difficoltà dei sentieri',
    mtbScale: 'Difficoltà MTB',
    smoothness: 'Stato delle strade',
    waymarking: 'Segnavia e cartelli',
  },
  baseMap: 'Mappa di base',
  noBaseMapHint:
    'Vengono disegnati solo i livelli selezionati, il resto è trasparente.',
  omitTitle: 'Tralascia',
  omit: {
    groundCover: 'Copertura del suolo',
    buildings: 'Edifici',
  },
  omitHint:
    'Trasparente dove qualcosa è tralasciato — da sovrapporre a una foto aerea, che lo mostra meglio.',
  lossless: 'Senza perdita',
  lossy: 'Con perdita',
  quality: 'Qualità',
  sizeTitle: 'Dimensione e dettaglio',
  zoom: 'Livello di zoom',
  printScale: 'Scala',
  mapScale: 'Risoluzione mappa',
  printSize: 'Dimensione di stampa',
  imageSize: "Dimensione dell'immagine",
  lock: 'Blocca',
  unlock: 'Sblocca',
  scaleFollowsZoom: 'Se non bloccata, la scala segue lo zoom.',
  symbolSize: ({ percent }) =>
    `Testi e simboli vengono stampati al ${percent} % della dimensione normale`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? "L'area è troppo grande da esportare. Esporta un'area più piccola."
      : `L'area è troppo grande per questo livello di zoom. Riduci lo zoom a ${zoom} o esporta un'area più piccola.`,
  customLayerOrder: 'Posizionamento dei dati mappa',
  orders: {
    natural: 'Naturale',
    topmost: 'In primo piano',
  },
  decorations: 'Decorazioni mappa',
  scaleBar: 'Barra della scala',
  northArrow: 'Freccia del nord',
  attribution: 'Attribuzione',
  legend: 'Legenda',
  legendWidens:
    'La legenda va accanto alla mappa, quindi il documento risulta più largo della carta scelta.',
  webpTooLarge:
    'WebP consente al massimo 16383 px per lato, che questa esportazione può superare. Scegli PNG o un DPI più basso.',
  northArrowLetter: 'N',
  glow: 'Alone',
  ready: 'La mappa è pronta',
  readyCredits: 'Quando pubblichi o condividi la mappa, indica queste fonti:',
  readyCreditsNone: 'Il renderer non ha indicato quali fonti ha usato.',
  readyUnknownSources: 'Fonti che non è stato possibile identificare:',
  copyCredits: 'Copia le fonti',
  openInNewTab: 'Apri in una nuova scheda',
  savedCredits: ({ credits }) =>
    `Mappa salvata. Quando la pubblichi o la condividi, indica: ${credits}`,
  alert: () => (
    <>
      Sarà esportata la mappa <i>{outdoorMap()}</i>. L’operazione potrebbe
      durare decine di secondi.
    </>
  ),
};

export default it;
