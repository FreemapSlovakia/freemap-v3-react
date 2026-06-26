import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const hu: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  upload: 'Feltöltés',
  moreInfo: 'További információ',
  saveAsMap: 'Mentés a térképeim közé',
  loginToSaveMap:
    'A nyomvonal a térképeid közé mentéséhez először jelentkezz be.',
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
    source: 'Magasság forrása',
    sourceOriginal: 'rögzített',
    sourcePartial: 'rögzített, hiányos',
    sourceFilledGaps: 'rögzített, hézagok kitöltve (NASA SRTM)',
    sourceFilled: 'NASA SRTM domborzatmodell',
  },
  uploadModal: {
    title: 'Fájl importálása',
    drop: 'Húzza ide a GPX-, KML-, KMZ-, TCX- vagy GeoJSON-fájlt, vagy kattintson ide a kijelöléséhez.',
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
    keep: 'Ne változzon semmi',
    keepDesc: 'a nyomvonalban tárolt magasság használata',
    add: 'Magasság hozzáadása',
    update: 'Magasság frissítése',
    updateConfirm:
      'Lecseréli a nyomvonal magasságát a NASA SRTM modellre (~30 m)?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'A hiányzó magasság ki lett töltve.'
        : 'A magasság felül lett írva.',
  },
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt a nyomvonal adatainak beolvasásakor',
      err,
    ),
  loadingError: 'Hiba történt a fájl betöltésekor.',
  onlyOne: 'Csak egyetlen fájl tölthető be.',
  invalidFormat: 'A fájl formátuma nem támogatott, vagy a fájl érvénytelen.',
};

export default hu;
