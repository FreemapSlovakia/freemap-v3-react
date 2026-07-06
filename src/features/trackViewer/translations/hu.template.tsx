import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import type { TrackViewerMessages } from './TrackViewerMessages.js';

const hu: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  style: {
    title: 'Alapértelmezett stílus',
  },
  info: () => <TrackViewerDetails />,
  upload: 'Feltöltés',
  trackLabel: 'Nyomvonal',
  unnamedTrack: ({ n }) => `${n}. nyomvonal`,
  convertLossWarning:
    'A rajzzá alakítás lecseréli a nyomvonalat, és eldobja a rögzített adatait (magasság, pulzusszám, sebesség, idő).',
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
    sourceFilledGaps: 'rögzített, hézagok kitöltve (domborzatmodell)',
    sourceFilled: 'domborzatmodell',
  },
  uploadModal: {
    title: 'Fájl importálása',
    drop: 'Húzza ide a GPX-, KML-, KMZ-, TCX- vagy GeoJSON-fájlt, vagy kattintson ide a kijelöléséhez.',
    mergeTitle: 'Az adatok már be vannak töltve',
    mergeMessage:
      'Már láthatók geoadatok. Hozzáfűzi az importált adatokat, vagy lecseréli őket?',
    append: 'Hozzáfűzés',
    replace: 'Csere',
  },
  elevationFill: {
    title: 'Magassági adatok',
    introNone: 'Ennek a nyomvonalnak nincsenek magassági adatai.',
    introPartial: 'A nyomvonal néhány pontjáról hiányzik a magasság.',
    introFull:
      'A nyomvonalnak már vannak magassági adatai, de egy domborzatmodell ' +
      'gyakran pontosabb.',
    premiumHiRes: (premiumLink) => (
      <>
        {premiumLink('Prémium hozzáféréssel')} a magassági adatokat a támogatott
        országokban nagy felbontású nemzeti modellből mintavételezzük — egyelőre
        Szlovákia (DMR 5.0: ÚGKK SR), továbbiak hamarosan.
      </>
    ),
    question: 'Mit szeretne tenni?',
    overrideAll: 'Összes felülírása',
    overrideAllDesc:
      'minden pont cseréje a domborzatmodellből — sima, egységes profil',
    fillMissing: 'Hiányzók pótlása',
    fillMissingDesc:
      'a rögzített értékek megtartása és csak a hézagok kitöltése (a két ' +
      'forrás találkozásánál lépcső jelenhet meg)',
    keep: 'Ne változzon semmi',
    keepDesc: 'a nyomvonalban tárolt magasság használata',
    add: 'Magasság hozzáadása',
    update: 'Magasság frissítése',
    updateConfirm: 'Lecseréli a nyomvonal magasságát a domborzatmodellre?',
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
  someFilesFailed: ({ names }) =>
    `Néhány fájlt nem sikerült betölteni: ${names}.`,
};

export default hu;
