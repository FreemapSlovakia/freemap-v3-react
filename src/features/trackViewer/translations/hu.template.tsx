import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const hu: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Feltöltés',
  moreInfo: 'További információ',
  share: 'Mentés a kiszolgálóra',
  colorizingMode: {
    none: 'Inaktív',
    elevation: 'Magasság',
    steepness: 'Meredekség',
    speed: 'Sebesség',
    heartRate: 'Pulzusszám',
    cadence: 'Kadencia',
    power: 'Teljesítmény',
    temperature: 'Hőmérséklet',
    time: 'Idő',
    heading: 'Irány',
  },
  details: {
    startTime: 'Indulási idő',
    finishTime: 'Érkezési idő',
    duration: 'Időtartam',
    distance: 'Távolság',
    avgSpeed: 'Átlagsebesség',
    minEle: 'Legkisebb magasság',
    maxEle: 'Legnagyobb magasság',
    uphill: 'Összes emelkedés',
    downhill: 'Összes lejtés',
    durationValue: ({ h, m }) => `${h} óra ${m} perc`,
  },
  uploadModal: {
    title: 'Fájl importálása',
    drop: 'Húzza ide a GPX- vagy GeoJSON-fájlt, vagy kattintson ide a kijelöléséhez.',
  },
  elevationFill: {
    title: 'Magassági adatok',
    introNone: 'Ennek a nyomvonalnak nincsenek magassági adatai.',
    introPartial: 'A nyomvonal néhány pontjáról hiányzik a magasság.',
    introFull:
      'A nyomvonalnak már vannak magassági adatai, de a NASA SRTM modell ' +
      '(~30 m) gyakran pontosabb.',
    question: 'Mit szeretne tenni?',
    overrideAll: 'Összes felülírása',
    overrideAllDesc:
      'minden pont cseréje az SRTM modellből — sima, egységes profil',
    fillMissing: 'Hiányzók pótlása',
    fillMissingDesc:
      'a rögzített értékek megtartása és csak a hézagok kitöltése (a két ' +
      'forrás találkozásánál lépcső jelenhet meg)',
    keep: 'Rögzített megtartása',
    keepDesc: 'a nyomvonalban tárolt magasság használata',
    add: 'Magasság hozzáadása',
  },
  shareToast:
    'Az útvonal el lett mentve a kiszolgálóra, és az oldal URL-jének másolásával megosztható.',
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt a nyomvonal adatainak beolvasásakor',
      err,
    ),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a nyomvonal mentésekor', err),
  loadingError: 'Hiba történt a fájl betöltésekor.',
  onlyOne: 'Csak egyetlen fájl tölthető be.',
  invalidFormat: 'A fájl formátuma nem támogatott, vagy a fájl érvénytelen.',
  tooBigError: 'Túl nagy a fájl.',
};

export default hu;
