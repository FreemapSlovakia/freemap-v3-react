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
  colorizingMode: {
    none: 'Inattivo',
    elevation: 'Elevazione',
    steepness: 'Ripidezza',
    speed: 'Velocità',
    heartRate: 'Frequenza cardiaca',
    cadence: 'Cadenza',
    power: 'Potenza',
    temperature: 'Temperatura',
    time: 'Tempo',
    heading: 'Direzione',
  },
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
  },
  uploadModal: {
    title: 'Importa file',
    drop: 'Trascina qui un file GPX o GeoJSON oppure clicca per selezionarlo.',
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
