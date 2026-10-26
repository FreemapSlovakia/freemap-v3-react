import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const hu: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  vertex: { channels: {} },
  split: {
    action: 'Felosztás',
    pick: 'Kattintson a nyomvonalra a felosztás helyén',
    here: 'Felosztás itt',
  },
  join: {
    action: 'Összefűzés',
    asLine: 'Összefűzés egy vonallá',
    asSegments: 'Összefűzés szakaszok megtartásával',
    pick: 'Kattintson a hozzáfűzendő nyomvonalra',
    pickEnd: 'Válasszon pontot a vonalak összekapcsolásához',
  },
  osmUpload: { visibilities: {}, visibilityHints: {} },
  match: {
    menuItem: 'Utakhoz illesztés',
    title: 'Utakhoz illesztés',
    help: 'A nyomvonalat a feltérképezett úthálózatra illeszti, ami megszünteti a GPS szórását, és — ez a lényeg — kideríti, min halad a nyomvonal, így színezhető burkolat, úttípus, erdei út minősége és nehézség szerint.',
    transport: 'Közlekedési mód',
    dataLoss:
      'Az illesztett vonalnak saját pontjai vannak, ezért az időbélyegek és a rögzített szenzoradatok (pulzus, kadencia, sebesség) elvesznek.',
    run: 'Illesztés',
    tooLong: 'Ennek a nyomvonalnak túl sok pontja van az illesztéshez.',
    tooShort: 'A nyomvonal túl rövid az illesztéshez.',
    brokenSequence:
      'A nyomvonal valahol elhagyja a feltérképezett úthálózatot, ezért nem illeszthető. Próbáljon másik közlekedési módot, vagy hagyja a nyomvonalat úgy, ahogy van.',
    offNetwork:
      'Az illesztett útvonal sokkal hosszabb lett a nyomvonalnál, ami azt jelenti, hogy a nyomvonal nem feltérképezett utakon haladt — például egy réten át. Az illesztés csak létező utakkal tud válaszolni, így az eredmény nem ott lenne, amerre járt. A nyomvonal változatlan marad.',
    partial:
      'A nyomvonal egyes részeit nem sikerült illeszteni — úgy maradnak, ahogy rögzítve lettek. Az útközben közlekedési módot váltó nyomvonalat (túra, majd autóút haza) előbb fel kell darabolni.',
  },
  info: () => <DataViewerDetails />,
  upload: 'Feltöltés',
  unnamedTrack: ({ n }) => `${n}. nyomvonal`,
  simplifyAll: 'Összes egyszerűsítése',
  moreInfo: 'További információ',
  breakApart: 'Szétbontás részekre',
  saveAsMap: 'Mentés a térképeim közé',
  loginToSaveMap:
    'A nyomvonal a térképei közé mentéséhez először jelentkezzen be.',
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
    existingData: 'Meglévő adatok',
    append: 'Hozzáfűzés',
    replace: 'Csere',
  },
  elevationFill: {
    title: 'Magassági adatok',
    introNone: 'Még nincsenek magassági adatok.',
    introPartial: 'Néhány pontról hiányzik a magasság.',
    introFull:
      'Már vannak magassági adatok, de egy domborzatmodell gyakran pontosabb.',
    premiumHiRes: (premiumLink, countries) => (
      <>
        {premiumLink('Prémium hozzáféréssel')} a magassági adatokat{' '}
        {countries('számos európai országban')} nagy felbontású nemzeti
        domborzatmodellekből mintavételezzük.
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
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'A hiányzó magasság ki lett töltve.'
        : mode === 'clear'
          ? 'A magasság törölve lett.'
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
  unsaved: 'Nem mentett',
  unsavedTooltip:
    'Ezek az adatok nem férnek el az oldal címében (URL), és egyetlen mentett térképen sem szerepelnek – csak ebben a böngészőben maradnak meg. Mentse őket a térképei közé, hogy megmaradjanak.',
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a nyomvonal illesztésekor', err),
};

export default hu;
