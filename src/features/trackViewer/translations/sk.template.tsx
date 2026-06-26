import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const sk: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Nahrať',
  moreInfo: 'Viac info',
  saveAsMap: 'Uložiť do mojich máp',
  loginToSaveMap: 'Pre uloženie trasy do vašich máp sa najprv prihláste.',
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
    source: 'Zdroj výšky',
    sourceOriginal: 'zaznamenaná',
    sourcePartial: 'zaznamenaná, neúplná',
    sourceFilledGaps: 'zaznamenaná, medzery doplnené (NASA SRTM)',
    sourceFilled: 'model terénu NASA SRTM',
  },
  uploadModal: {
    title: 'Importovať súbor',
    drop: 'Potiahnite sem súbor GPX, KML, KMZ, TCX alebo GeoJSON alebo kliknite sem pre jeho výber.',
  },
  elevationFill: {
    title: 'Nadmorská výška',
    introNone: 'Táto trasa nemá údaje o nadmorskej výške.',
    introPartial: 'Tejto trase chýba nadmorská výška pre niektoré body.',
    introFull:
      'Táto trasa už má nadmorskú výšku, no model NASA SRTM (~30 m) býva ' +
      'často presnejší.',
    question: 'Čo chcete urobiť?',
    overrideAll: 'Prepísať všetko',
    overrideAllDesc:
      'nahradiť každý bod z modelu SRTM — plynulý a konzistentný profil',
    fillMissing: 'Doplniť chýbajúce',
    fillMissingDesc:
      'zachovať zaznamenané hodnoty a doplniť len medzery (na rozhraní ' +
      'oboch zdrojov môže vzniknúť skok)',
    keep: 'Nič nemeniť',
    keepDesc: 'použiť nadmorskú výšku uloženú v trase',
    add: 'Doplniť výšku',
    update: 'Aktualizovať výšku',
    updateConfirm: 'Nahradiť nadmorskú výšku trasy modelom NASA SRTM (~30 m)?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Chýbajúca nadmorská výška bola doplnená.'
        : 'Nadmorská výška bola prepísaná.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní záznamu trasy', err),
  loadingError: 'Súbor sa nepodarilo načítať.',
  onlyOne: 'Očakáva sa iba jeden súbor.',
  invalidFormat: 'Súbor nie je v podporovanom formáte alebo je neplatný.',
};

export default sk;
