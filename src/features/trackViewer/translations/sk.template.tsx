import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const sk: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Nahrať',
  trackLabel: 'Trasa',
  unnamedTrack: ({ n }) => `Trasa ${n}`,
  convertLossWarning:
    'Prevod na kresbu nahradí trasu a zahodí jej zaznamenané údaje (nadmorská výška, tep, rýchlosť, čas).',
  moreInfo: 'Viac info',
  saveAsMap: 'Uložiť do mojich máp',
  loginToSaveMap: 'Pre uloženie trasy do vašich máp sa najprv prihláste.',
  style: {
    title: 'Predvolený štýl',
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
    source: 'Zdroj výšky',
    sourceOriginal: 'zaznamenaná',
    sourcePartial: 'zaznamenaná, neúplná',
    sourceFilledGaps: 'zaznamenaná, medzery doplnené (model terénu)',
    sourceFilled: 'model terénu',
  },
  uploadModal: {
    title: 'Importovať súbor',
    drop: 'Potiahnite sem súbor GPX, KML, KMZ, TCX alebo GeoJSON alebo kliknite sem pre jeho výber.',
    mergeTitle: 'Údaje sú už načítané',
    mergeMessage:
      'Niektoré geoúdaje sú už zobrazené. Pripojiť k nim importované údaje, alebo ich nahradiť?',
    append: 'Pripojiť',
    replace: 'Nahradiť',
  },
  elevationFill: {
    title: 'Nadmorská výška',
    introNone: 'Táto trasa nemá údaje o nadmorskej výške.',
    introPartial: 'Tejto trase chýba nadmorská výška pre niektoré body.',
    introFull:
      'Táto trasa už má nadmorskú výšku, no model terénu býva často presnejší.',
    premiumHiRes: (premiumLink) => (
      <>
        S {premiumLink('prémiovým prístupom')} sa nadmorská výška v
        podporovaných krajinách získava z národného modelu vo vysokom rozlíšení
        — zatiaľ Slovensko (DMR 5.0: ÚGKK SR), ďalšie pribudnú.
      </>
    ),
    question: 'Čo chcete urobiť?',
    overrideAll: 'Prepísať všetko',
    overrideAllDesc:
      'nahradiť každý bod z modelu terénu — plynulý a konzistentný profil',
    fillMissing: 'Doplniť chýbajúce',
    fillMissingDesc:
      'zachovať zaznamenané hodnoty a doplniť len medzery (na rozhraní ' +
      'oboch zdrojov môže vzniknúť skok)',
    keep: 'Nič nemeniť',
    keepDesc: 'použiť nadmorskú výšku uloženú v trase',
    add: 'Doplniť výšku',
    update: 'Aktualizovať výšku',
    updateConfirm: 'Nahradiť nadmorskú výšku trasy modelom terénu?',
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
  someFilesFailed: ({ names }) =>
    `Niektoré súbory sa nepodarilo načítať: ${names}.`,
};

export default sk;
