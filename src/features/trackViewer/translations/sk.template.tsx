import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const sk: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Nahrať',
  moreInfo: 'Viac info',
  share: 'Uložiť na server',
  colorizingMode: {
    none: 'Neaktívne',
    elevation: 'Nadmorská výška',
    steepness: 'Sklon',
    speed: 'Rýchlosť',
    heartRate: 'Tepová frekvencia',
    cadence: 'Kadencia',
    power: 'Výkon',
    temperature: 'Teplota',
    time: 'Čas',
    heading: 'Smer',
  },
  details: {
    startTime: 'Čas štartu',
    finishTime: 'Čas v cieli',
    duration: 'Trvanie',
    distance: 'Vzdialenosť',
    avgSpeed: 'Priemerná rýchlosť',
    minEle: 'Najnižší bod',
    maxEle: 'Najvyšší bod',
    uphill: 'Celkové stúpanie',
    downhill: 'Celkové klesanie',
    durationValue: ({ h, m }) => `${h} hodín ${m} minút`,
  },
  uploadModal: {
    title: 'Importovať súbor',
    drop: 'Potiahnite sem súbor GPX alebo GeoJSON alebo kliknite sem pre jeho výber.',
  },
  shareToast:
    'Trasa bola uložená na server a môžete ju zdieľať skopirovaním URL stránky.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní záznamu trasy', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa uložiť trasu', err),
  loadingError: 'Súbor sa nepodarilo načítať.',
  onlyOne: 'Očakáva sa iba jeden súbor.',
  invalidFormat: 'Súbor nie je v podporovanom formáte alebo je neplatný.',
  tooBigError: 'Nahraný súbor je príliš veľký.',
};

export default sk;
