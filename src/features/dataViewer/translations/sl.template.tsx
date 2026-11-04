import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const sl: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  info: () => <DataViewerDetails />,
  upload: 'Naloži',
  unnamedTrack: ({ n }) => `Sled ${n}`,
  simplifyAll: 'Poenostavi vse',
  moreInfo: 'Več informacij',
  breakApart: 'Razdeli na dele',
  saveAsMap: 'Shrani med moje zemljevide',
  loginToSaveMap:
    'Za shranjevanje sledi med vaše zemljevide se najprej prijavite.',
  vertex: {
    channels: {
      heart: 'Srčni utrip',
      cads: 'Kadenca',
      atemps: 'Temperatura zraka',
      wtemps: 'Temperatura vode',
      depths: 'Globina',
      speeds: 'Hitrost',
      courses: 'Smer gibanja',
      bearings: 'Azimut',
      powers: 'Moč',
      accuracies: 'Natančnost',
      battery: 'Baterija',
      gsmSignal: 'Signal GSM',
    },
    menuItem: 'Podatki točke',
    latitude: 'Zemljepisna širina',
    longitude: 'Zemljepisna dolžina',
    elevation: 'Nadmorska višina',
    time: 'Čas',
    filled: ({ filled, total }) => `${filled} od ${total} točk`,
    emptyHint:
      'Prazno polje pusti točko brez te vrednosti. Katere vrednosti ima črta, se nastavi v njenih lastnostih.',
    notANumber: 'Vnesite število.',
    outOfRange: 'Zunaj obsega.',
    timeOrder: 'Čas mora biti med časoma prejšnje in naslednje točke.',
  },
  split: {
    action: 'Razdeli',
    pick: 'Kliknite sled na mestu razdelitve',
    here: 'Razdeli tukaj',
  },
  join: {
    action: 'Združi',
    asLine: 'Združi v eno črto',
    asSegments: 'Združi z ohranitvijo odsekov',
    pick: 'Kliknite sled, s katero želite združiti',
    pickEnd: 'Izberite točko za združitev črt',
  },
  osmUpload: {
    visibilities: {
      identifiable: 'Prepoznavna',
      public: 'Javna',
      trackable: 'Sledljiva',
      private: 'Zasebna',
    },
    visibilityHints: {
      identifiable:
        'Prikazana na seznamu sledi z vašim imenom, kot urejene točke s časovnimi oznakami.',
      public:
        'Prikazana na seznamu sledi z vašim imenom, kot anonimne neurejene točke.',
      trackable: 'Deljena le kot anonimne urejene točke s časovnimi oznakami.',
      private: 'Deljena le kot anonimne neurejene točke.',
    },
    menuItem: 'Naloži GPS sled v OpenStreetMap',
    title: 'Naloži GPS sled v OpenStreetMap',
    help: 'Naloži prikazane sledi v vaš račun OpenStreetMap kot GPS sled, po kateri lahko kartografi vrišejo poti. Naložijo se le sledi z zabeleženimi časi, saj OpenStreetMap drugih ne hrani. Nalagajte le sledi, ki ste jih sami posneli.',
    description: 'Opis',
    tags: 'Oznake',
    tagsHint: 'Ločene z vejicami.',
    tagsInvalid:
      'OpenStreetMap v oznaki ne sprejme znakov . ; / ? % ali # niti oznake, daljše od 255 znakov.',
    visibility: 'Vidnost',
    upload: 'Naloži',
    loginPrompt:
      'Za nalaganje se morate prijaviti prek OpenStreetMap in Freemapu dovoliti nalaganje GPS sledi. Želite nadaljevati?',
    connectPrompt:
      'Za nalaganje morate z računom Freemap povezati račun OpenStreetMap in Freemapu dovoliti, da vanj nalaga GPS sledi. Če že imate drug račun Freemap, v katerega se prijavljate s tem računom OpenStreetMap, se oba računa združita v enega. Želite nadaljevati?',
    authorizePrompt:
      'Za nalaganje morate Freemapu dovoliti nalaganje GPS sledi v vaš račun OpenStreetMap. Želite nadaljevati?',
    reauthorize:
      'Dovoljenje Freemapu za nalaganje GPS sledi v vaš račun OpenStreetMap je bilo pravkar preklicano. Znova kliknite Naloži in ga dovolite.',
    success: ({ url }) => (
      <>
        Sled je naložena. OpenStreetMap jo obdela v nekaj minutah.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Prikaži sled v OpenStreetMap
        </a>
      </>
    ),
  },
  match: {
    menuItem: 'Pripni na poti',
    title: 'Pripni na poti',
    help: 'Pripne sled na omrežje popisanih poti, kar odpravi razpršenost GPS in — to je bistvo — ugotovi, po čem sled poteka, tako da jo je mogoče obarvati po podlagi, vrsti poti, kakovosti gozdne ceste in zahtevnosti.',
    transport: 'Način potovanja',
    dataLoss:
      'Pripeta črta ima svoje točke, zato bodo časovne oznake in zabeleženi podatki senzorjev (srčni utrip, kadenca, hitrost) izgubljeni.',
    run: 'Pripni',
    tooLong: 'Ta sled ima preveč točk za pripenjanje.',
    tooShort: 'Sled je prekratka za pripenjanje.',
    brokenSequence:
      'Sled nekje zapusti omrežje popisanih poti, zato je ni mogoče pripeti. Poskusite drug način potovanja ali pustite sled takšno, kot je.',
    offNetwork:
      'Pripeta pot je izšla precej daljša od sledi, kar pomeni, da sled ni potekala po popisanih poteh — denimo čez travnik. Pripenjanje lahko odgovori le z obstoječimi potmi, zato rezultat ne bi bil tam, kjer ste hodili. Sled ostaja nespremenjena.',
    partial:
      'Nekaterih delov sledi ni bilo mogoče pripeti — ostajajo takšni, kot so bili zabeleženi. Sled, ki na sredi zamenja način potovanja (pohod, nato vožnja domov), je treba najprej razdeliti.',
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
    existingData: 'Obstoječi podatki',
    append: 'Pripni',
    replace: 'Nadomesti',
  },
  trace: {
    streams: 'Izris vodotokov',
    forests: 'Izris gozdov',
    streamsHelp:
      'Služi za izpeljavo črt vodotokov iz modela reliefa visoke ločljivosti v izbranem poligonu. Primerno za kartiranje v OpenStreetMap.',
    forestsHelp:
      'Služi za izris površin, ki jih v izbranem poligonu pokrivajo izbrani razredi točk LiDAR. Primerno predvsem za kartiranje pokrovnosti tal v OpenStreetMap.',
    pixelSize: 'Velikost slikovne točke',
    pixelSizeHint: 'Prazno za lastno ločljivost modela reliefa.',
    threshold: 'Najmanjša površina povodja',
    minLength: 'Najmanjša dolžina vodotoka',
    simplify: 'Toleranca poenostavitve',
    classes: 'Razredi točk',
    classNames: {
      lowVegetation: 'Nizka vegetacija',
      mediumVegetation: 'Srednja vegetacija',
      highVegetation: 'Visoka vegetacija',
      building: 'Stavbe',
      water: 'Voda',
    },
    output: 'Rezultat',
    outputJosm: 'Odpri v JOSM',
    outputOsm: 'Prenesi kot OSM XML',
    outputGeojson: 'Prenesi kot GeoJSON',
    tooBig: ({ max }) => `Poligon je prevelik; omejitev je ${max}.`,
    run: 'Izriši',
    legacy: ({ phrase, item }) => (
      <>
        Namesto <i>velikonočnega jajca</i> <code>{phrase}</code> uporabite
        postavko <i>{item}</i> v meniju ⋮ izbranega poligona.
      </>
    ),
  },
  elevationFill: {
    title: 'Podatki o nadmorski višini',
    introNone: 'Podatkov o nadmorski višini še ni.',
    introPartial: 'Nekaterim točkam manjka nadmorska višina.',
    introFull:
      'Nadmorska višina je že podana, vendar je model terena pogosto natančnejši.',
    premiumHiRes: (premiumLink, countries) => (
      <>
        S {premiumLink('premium dostopom')} se nadmorska višina v{' '}
        {countries('številnih evropskih državah')} pridobi iz nacionalnih
        modelov terena visoke ločljivosti.
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
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Manjkajoča nadmorska višina je bila zapolnjena.'
        : mode === 'clear'
          ? 'Nadmorska višina je bila odstranjena.'
          : 'Nadmorska višina je bila prepisana.',
    clear: 'Izbriši nadmorsko višino',
    clearDesc:
      'odstrani shranjeno nadmorsko višino; profili jo nato berejo iz modela terena',
  },
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju podatkov o sledi', err),
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pripenjanju sledi', err),
  loadingError: 'Datoteke ni bilo mogoče naložiti.',
  onlyOne: 'Pričakovana je samo ena datoteka.',
  invalidFormat: 'Datoteka ni v podprti obliki ali je neveljavna.',
  someFilesFailed: ({ names }) =>
    `Nekaterih datotek ni bilo mogoče naložiti: ${names}.`,
  unsaved: 'Ni shranjeno',
  unsavedTooltip:
    'Teh podatkov ni mogoče vstaviti v naslov strani (URL) in niso v nobenem shranjenem zemljevidu – ostanejo samo v tem brskalniku. Shranite jih med svoje zemljevide, da jih ohranite.',
  snapshotGone: 'Podatkov iz tega koraka ta brskalnik ne hrani več.',
  snapshotFailed:
    'Ta brskalnik podatkov ni mogel ohraniti, zato se ob ponovnem nalaganju strani izgubijo. Če jih želite obdržati, jih shranite med svoje zemljevide.',
  osmUploadError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju v OpenStreetMap', err),
};

export default sl;
