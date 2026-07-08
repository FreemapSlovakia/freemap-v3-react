import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import type { TrackViewerMessages } from './TrackViewerMessages.js';

const it: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  style: {
    title: 'Stile predefinito',
  },
  info: () => <TrackViewerDetails />,
  upload: 'Carica',
  trackLabel: 'Traccia',
  unnamedTrack: ({ n }) => `Traccia ${n}`,
  convertLossWarning:
    'La conversione in disegno sostituisce la traccia e ne scarta i dati registrati (quota, frequenza cardiaca, velocità, tempo).',
  moreInfo: 'Maggiori info',
  saveAsMap: 'Salva nelle mie mappe',
  loginToSaveMap: 'Accedi prima per salvare la traccia nelle tue mappe.',
  details: {
    startTime: 'Ora inizio',
    finishTime: 'Ora fine',
    duration: 'Durata',
    distance: 'Distanza',
    avgSpeed: 'Velocità media',
    minEle: 'Elevazione min.',
    maxEle: 'Elevazione max',
    uphill: 'Ascesa totale',
    downhill: 'Discesa totale',
    durationValue: ({ h, m }) => `${h} ore ${m} minuti`,
    source: 'Origine quota',
    sourceOriginal: 'registrata',
    sourcePartial: 'registrata, incompleta',
    sourceFilledGaps: 'registrata, lacune riempite (modello del terreno)',
    sourceFilled: 'modello del terreno',
  },
  uploadModal: {
    title: 'Importa file',
    drop: 'Trascina qui un file GPX, KML, KMZ, TCX o GeoJSON oppure clicca per selezionarlo.',
    mergeTitle: 'Dati già caricati',
    mergeMessage:
      'Alcuni geodati sono già visualizzati. Aggiungere i dati importati o sostituirli?',
    append: 'Aggiungi',
    replace: 'Sostituisci',
  },
  elevationFill: {
    title: 'Dati di quota',
    introNone: 'Questa traccia non ha dati di quota.',
    introPartial: 'In alcuni punti di questa traccia manca la quota.',
    introFull:
      'Questa traccia ha già la quota, ma un modello del terreno è spesso ' +
      'più preciso.',
    premiumHiRes: (premiumLink) => (
      <>
        Con l’{premiumLink('accesso premium')}, nei paesi supportati la quota è
        campionata da un modello nazionale ad alta risoluzione — per ora
        Slovacchia (DMR 5.0: ÚGKK SR), altri in arrivo.
      </>
    ),
    question: 'Cosa vuoi fare?',
    overrideAll: 'Sovrascrivi tutto',
    overrideAllDesc:
      'sostituisci ogni punto con il modello del terreno — un profilo ' +
      'uniforme e coerente',
    fillMissing: 'Riempi mancanti',
    fillMissingDesc:
      'mantieni i valori registrati e riempi solo le lacune (potrebbero ' +
      'esserci scalini dove i due dati si incontrano)',
    keep: 'Non modificare',
    keepDesc: 'usa la quota memorizzata nella traccia',
    add: 'Aggiungi quota',
    update: 'Aggiorna quota',
    updateConfirm:
      'Sostituire la quota della traccia con il modello del terreno?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'La quota mancante è stata riempita.'
        : 'La quota è stata sovrascritta.',
  },
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore durante il recupero dei dati della traccia:',
      err,
    ),
  loadingError: 'Errore nel caricamento del file.',
  onlyOne: "E' atteso un singolo file.",
  invalidFormat: 'Il file non è in un formato supportato o non è valido.',
  someFilesFailed: ({ names }) => `Impossibile caricare alcuni file: ${names}.`,
};

export default it;
