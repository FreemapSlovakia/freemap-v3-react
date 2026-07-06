import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import type { TrackViewerMessages } from './TrackViewerMessages.js';

const sl: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Naloži',
  trackLabel: 'Sled',
  unnamedTrack: ({ n }) => `Sled ${n}`,
  convertLossWarning:
    'Pretvorba v risbo nadomesti sled in zavrže njene zabeležene podatke (nadmorska višina, srčni utrip, hitrost, čas).',
  moreInfo: 'Več informacij',
  saveAsMap: 'Shrani med moje zemljevide',
  loginToSaveMap:
    'Za shranjevanje sledi med vaše zemljevide se najprej prijavite.',
  style: {
    title: 'Privzeti slog',
  },
  details: {
    startTime: 'Čas začetka',
    finishTime: 'Čas v cilju',
    duration: 'Trajanje',
    distance: 'Razdalja',
    avgSpeed: 'Povprečna hitrost',
    minEle: 'Najnižja točka',
    maxEle: 'Najvišja točka',
    uphill: 'Skupni vzpon',
    downhill: 'Skupni spust',
    durationValue: ({ h, m }) => `${h} ur ${m} minut`,
    source: 'Vir nadmorske višine',
    sourceOriginal: 'zabeležena',
    sourcePartial: 'zabeležena, nepopolna',
    sourceFilledGaps: 'zabeležena, vrzeli zapolnjene (model terena)',
    sourceFilled: 'model terena',
  },
  uploadModal: {
    title: 'Uvozi datoteko',
    drop: 'Sem povlecite datoteke GPX, KML, KMZ, TCX ali GeoJSON ali kliknite za njihovo izbiro. Izberete lahko več datotek naenkrat.',
    mergeTitle: 'Podatki so že naloženi',
    mergeMessage:
      'Nekateri geopodatki so že prikazani. Ali jim uvožene podatke pripnete ali jih nadomestite?',
    append: 'Pripni',
    replace: 'Nadomesti',
  },
  elevationFill: {
    title: 'Podatki o nadmorski višini',
    introNone: 'Ta sled nima podatkov o nadmorski višini.',
    introPartial: 'Tej sledi za nekatere točke manjka nadmorska višina.',
    introFull:
      'Ta sled že ima nadmorsko višino, vendar je model terena pogosto natančnejši.',
    premiumHiRes: (premiumLink) => (
      <>
        S {premiumLink('premium dostopom')} se nadmorska višina v podprtih
        državah pridobi iz nacionalnega modela visoke ločljivosti — zaenkrat
        Slovaška (DMR 5.0: ÚGKK SR), sledijo še druge.
      </>
    ),
    question: 'Kaj želite storiti?',
    overrideAll: 'Prepiši vse',
    overrideAllDesc:
      'nadomesti vsako točko z modelom terena — gladek in enoten profil',
    fillMissing: 'Zapolni manjkajoče',
    fillMissingDesc:
      'ohrani zabeležene vrednosti in zapolni le vrzeli (na stiku obeh ' +
      'virov lahko nastane skok)',
    keep: 'Pusti nespremenjeno',
    keepDesc: 'uporabi nadmorsko višino, shranjeno v sledi',
    add: 'Dodaj nadmorsko višino',
    update: 'Posodobi nadmorsko višino',
    updateConfirm: 'Nadmorsko višino sledi nadomestim z modelom terena?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Manjkajoča nadmorska višina je bila zapolnjena.'
        : 'Nadmorska višina je bila prepisana.',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju podatkov o sledi', err),
  loadingError: 'Datoteke ni bilo mogoče naložiti.',
  onlyOne: 'Pričakovana je samo ena datoteka.',
  invalidFormat: 'Datoteka ni v podprti obliki ali je neveljavna.',
  someFilesFailed: ({ names }) =>
    `Nekaterih datotek ni bilo mogoče naložiti: ${names}.`,
};

export default sl;
