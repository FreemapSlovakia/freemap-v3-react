import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const hu: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  vertex: {
    channels: {
      heart: 'Pulzus',
      cads: 'Kadencia',
      atemps: 'Léghőmérséklet',
      wtemps: 'Vízhőmérséklet',
      depths: 'Mélység',
      speeds: 'Sebesség',
      courses: 'Haladási irány',
      bearings: 'Azimut',
      powers: 'Teljesítmény',
      accuracies: 'Pontosság',
      battery: 'Akkumulátor',
      gsmSignal: 'GSM-jel',
    },
    menuItem: 'Pont adatai',
    latitude: 'Földrajzi szélesség',
    longitude: 'Földrajzi hosszúság',
    elevation: 'Tengerszint feletti magasság',
    time: 'Idő',
    filled: ({ filled, total }) => `${filled} / ${total} pont`,
    emptyHint:
      'Üres mező esetén a pontnak nem lesz ilyen értéke. Hogy a vonal milyen értékeket tartalmaz, azt a Tulajdonságai között lehet beállítani.',
    notANumber: 'Adjon meg egy számot.',
    outOfRange: 'Tartományon kívül.',
    timeOrder: 'Az időnek az előző és a következő pont ideje közé kell esnie.',
  },
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
  osmUpload: {
    visibilities: {
      identifiable: 'Azonosítható',
      public: 'Nyilvános',
      trackable: 'Követhető',
      private: 'Privát',
    },
    visibilityHints: {
      identifiable:
        'Az Ön nevével jelenik meg a nyomvonalak listájában, sorba rendezett, időbélyeges pontokként.',
      public:
        'Az Ön nevével jelenik meg a nyomvonalak listájában, névtelen, rendezetlen pontokként.',
      trackable:
        'Csak névtelen, sorba rendezett, időbélyeges pontokként kerül megosztásra.',
      private: 'Csak névtelen, rendezetlen pontokként kerül megosztásra.',
    },
    menuItem: 'GPS-nyomvonal feltöltése az OpenStreetMapre',
    title: 'GPS-nyomvonal feltöltése az OpenStreetMapre',
    help: 'A betöltött nyomvonalakat GPS-nyomvonalként feltölti az Ön OpenStreetMap-fiókjába, amely alapján a térképezők megrajzolhatják az utakat. Csak a rögzített időket tartalmazó nyomvonalak kerülnek feltöltésre, mert az OpenStreetMap mást nem tárol. Csak saját maga által rögzített nyomvonalakat töltsön fel.',
    description: 'Leírás',
    tags: 'Címkék',
    tagsHint: 'Vesszővel elválasztva.',
    tagsInvalid:
      'Az OpenStreetMap nem fogad el címkében . ; / ? % vagy # karaktert, sem 255 karakternél hosszabb címkét.',
    visibility: 'Láthatóság',
    upload: 'Feltöltés',
    loginPrompt:
      'A feltöltéshez be kell jelentkeznie az OpenStreetMappel, és engedélyeznie kell, hogy a Freemap GPS-nyomvonalakat töltsön fel. Folytatja?',
    connectPrompt:
      'A feltöltéshez OpenStreetMap-fiókot kell kapcsolnia a Freemap-fiókjához, és engedélyeznie kell, hogy a Freemap GPS-nyomvonalakat töltsön fel bele. Ha már van egy másik Freemap-fiókja, amelybe ezzel az OpenStreetMap-fiókkal jelentkezik be, a két fiók egyesül. Folytatja?',
    authorizePrompt:
      'A feltöltéshez engedélyeznie kell, hogy a Freemap GPS-nyomvonalakat töltsön fel az Ön OpenStreetMap-fiókjába. Folytatja?',
    reauthorize:
      'A Freemap engedélye GPS-nyomvonalak feltöltésére az Ön OpenStreetMap-fiókjába éppen most vissza lett vonva. Kattintson ismét a Feltöltés gombra, és engedélyezze újra.',
    success: ({ url }) => (
      <>
        A nyomvonal feltöltése megtörtént. Az OpenStreetMap néhány percen belül
        feldolgozza.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Nyomvonal megtekintése az OpenStreetMapen
        </a>
      </>
    ),
  },
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
  trace: {
    streams: 'Vízfolyások kirajzolása',
    forests: 'Erdők kirajzolása',
    streamsHelp:
      'A kijelölt sokszögön belül a nagy felbontású domborzatmodellből vezeti le a vízfolyások vonalait. OpenStreetMapbe való térképezéshez hasznos.',
    forestsHelp:
      'A kijelölt sokszögön belül a kiválasztott LiDAR-pontosztályok által fedett területek kirajzolására szolgál. Elsősorban a felszínborítás OpenStreetMapbe való térképezéséhez hasznos.',
    pixelSize: 'Pixelméret',
    pixelSizeHint: 'Üresen a domborzatmodell saját felbontása.',
    threshold: 'Legkisebb vízgyűjtő terület',
    minLength: 'Legkisebb vízfolyáshossz',
    simplify: 'Egyszerűsítési tűrés',
    classes: 'Pontosztályok',
    classNames: {
      lowVegetation: 'Alacsony növényzet',
      mediumVegetation: 'Közepes növényzet',
      highVegetation: 'Magas növényzet',
      building: 'Épületek',
      water: 'Víz',
    },
    output: 'Eredmény',
    outputJosm: 'Megnyitás JOSM-ben',
    outputOsm: 'Letöltés OSM XML-ként',
    outputGeojson: 'Letöltés GeoJSON-ként',
    tooBig: ({ max }) => `A sokszög túl nagy; a határ ${max}.`,
    run: 'Kirajzolás',
    legacy: ({ phrase, item }) => (
      <>
        A <code>{phrase}</code> <i>easter egg</i> helyett a kijelölt sokszög ⋮
        menüjének <i>{item}</i> elemét használja.
      </>
    ),
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
    clear: 'Magasság törlése',
    clearDesc:
      'a tárolt magasság eltávolítása; a profilok ezután a domborzatmodellből olvassák',
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
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a nyomvonal illesztésekor', err),
  snapshotGone:
    'Az ebben a lépésben látható adatokat ez a böngésző már nem őrzi.',
  snapshotFailed:
    'Ez a böngésző nem tudta megőrizni az adatokat, így az oldal újratöltésekor elvesznek. Megőrzésükhöz mentse őket a térképei közé.',
  osmUploadError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt az OpenStreetMapre való feltöltéskor',
      err,
    ),
};

export default hu;
