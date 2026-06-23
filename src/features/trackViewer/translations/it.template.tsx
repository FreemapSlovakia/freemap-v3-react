import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const it: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Carica',
  moreInfo: 'Maggiori info',
  share: 'Salva sul Server',
  details: {
    startTime: 'Ora inizio',
    finishTime: 'Ora fine',
    duration: 'Durata',
    distance: 'Distanza',
    avgSpeed: 'Velocità media',
    minEle: 'Elevazione min.',
    maxEle: 'Elevazione max',
    uphill: 'Acesca totale',
    downhill: 'Discesa totale',
    durationValue: ({ h, m }) => `${h} ore ${m} minuti`,
    source: 'Origine quota',
    sourceOriginal: 'registrata',
    sourcePartial: 'registrata, incompleta',
    sourceFilledGaps: 'registrata, lacune riempite (NASA SRTM)',
    sourceFilled: 'modello del terreno NASA SRTM',
  },
  uploadModal: {
    title: 'Importa file',
    drop: 'Trascina qui un file GPX o GeoJSON oppure clicca per selezionarlo.',
  },
  elevationFill: {
    title: 'Dati di quota',
    introNone: 'Questa traccia non ha dati di quota.',
    introPartial: 'In alcuni punti di questa traccia manca la quota.',
    introFull:
      'Questa traccia ha già la quota, ma il modello NASA SRTM (~30 m) è ' +
      'spesso più preciso.',
    question: 'Cosa vuoi fare?',
    overrideAll: 'Sovrascrivi tutto',
    overrideAllDesc:
      'sostituisci ogni punto con il modello SRTM — un profilo uniforme e ' +
      'coerente',
    fillMissing: 'Riempi mancanti',
    fillMissingDesc:
      'mantieni i valori registrati e riempi solo le lacune (potrebbero ' +
      'esserci scalini dove i due dati si incontrano)',
    keep: 'Non modificare',
    keepDesc: 'usa la quota memorizzata nella traccia',
    add: 'Aggiungi quota',
    update: 'Aggiorna quota',
    updateConfirm:
      'Sostituire la quota della traccia con il modello NASA SRTM (~30 m)?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'La quota mancante è stata riempita.'
        : 'La quota è stata sovrascritta.',
  },
  shareToast:
    "La traccia è stata salvata sul server e può essere condivisa copiando l'URL della pagina.",
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore durante il recupero dei dati della traccia:',
      err,
    ),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Errore nel salvataggio della traccia:', err),
  loadingError: 'Errore nel caricamento del file.',
  onlyOne: "E' atteso un singolo file.",
  invalidFormat: 'Il file non è in un formato supportato o non è valido.',
  tooBigError: 'Il file è troppo grande.',
};

export default it;
