import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const it: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  vertex: {
    channels: {
      heart: 'Frequenza cardiaca',
      cads: 'Cadenza',
      atemps: 'Temperatura dell’aria',
      wtemps: 'Temperatura dell’acqua',
      depths: 'Profondità',
      speeds: 'Velocità',
      courses: 'Direzione di marcia',
      bearings: 'Azimut',
      powers: 'Potenza',
      accuracies: 'Precisione',
      battery: 'Batteria',
      gsmSignal: 'Segnale GSM',
    },
    menuItem: 'Dati del punto',
    latitude: 'Latitudine',
    longitude: 'Longitudine',
    elevation: 'Quota',
    time: 'Ora',
    filled: ({ filled, total }) => `${filled} punti su ${total}`,
    emptyHint:
      'Un campo vuoto lascia il punto senza quel valore. Quali valori ha la linea si imposta nelle sue Proprietà.',
    notANumber: 'Inserisca un numero.',
    outOfRange: 'Fuori intervallo.',
    timeOrder:
      'L’ora deve essere compresa tra quelle del punto precedente e del successivo.',
  },
  split: {
    action: 'Dividi',
    pick: 'Clicchi la traccia nel punto di divisione',
    here: 'Dividi qui',
  },
  join: {
    action: 'Unisci',
    asLine: 'Unisci in una sola linea',
    asSegments: 'Unisci mantenendo i segmenti',
    pick: 'Clicchi la traccia da unire',
    pickEnd: 'Selezioni un punto per unire le linee',
  },
  osmUpload: {
    visibilities: {
      identifiable: 'Identificabile',
      public: 'Pubblica',
      trackable: 'Tracciabile',
      private: 'Privata',
    },
    visibilityHints: {
      identifiable:
        'Mostrata nell’elenco delle tracce con il suo nome, come punti ordinati con marche temporali.',
      public:
        'Mostrata nell’elenco delle tracce con il suo nome, come punti anonimi non ordinati.',
      trackable:
        'Condivisa solo come punti anonimi ordinati con marche temporali.',
      private: 'Condivisa solo come punti anonimi non ordinati.',
    },
    menuItem: 'Carica traccia GPS su OpenStreetMap',
    title: 'Carica traccia GPS su OpenStreetMap',
    help: 'Carica nel suo account OpenStreetMap le tracce aperte come traccia GPS, da cui i mappatori possono ricalcare i percorsi. Vengono caricate solo le tracce con orari registrati, perché OpenStreetMap non conserva altro. Carichi solo tracce registrate da lei.',
    description: 'Descrizione',
    tags: 'Etichette',
    tagsHint: 'Separate da virgole.',
    tagsInvalid:
      'OpenStreetMap non accetta . ; / ? % o # in un’etichetta, né etichette più lunghe di 255 caratteri.',
    visibility: 'Visibilità',
    upload: 'Carica',
    loginPrompt:
      'Per caricare occorre accedere con OpenStreetMap e consentire a Freemap di caricare tracce GPS. Continuare?',
    connectPrompt:
      'Per caricare occorre collegare il suo account OpenStreetMap al suo account Freemap e consentirgli di ricevere tracce GPS da Freemap. Se ha già un altro account Freemap a cui accede con quell’account OpenStreetMap, i due account verranno uniti in uno solo. Continuare?',
    authorizePrompt:
      'Per caricare occorre consentire a Freemap di caricare tracce GPS nel suo account OpenStreetMap. Continuare?',
    reauthorize:
      'L’autorizzazione di Freemap a caricare tracce GPS nel suo account OpenStreetMap è appena stata revocata. Clicchi di nuovo Carica per concederla.',
    success: ({ url }) => (
      <>
        La traccia è stata caricata. OpenStreetMap la elabora entro pochi
        minuti.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Mostra la traccia su OpenStreetMap
        </a>
      </>
    ),
  },
  match: {
    menuItem: 'Aggancia ai percorsi',
    title: 'Aggancia ai percorsi',
    help: 'Aggancia la traccia alla rete di strade e sentieri mappati, eliminando la dispersione del GPS e — questo è il punto — determinando su cosa passa la traccia, così da poterla colorare per fondo, tipo di strada, qualità della sterrata e difficoltà.',
    transport: 'Mezzo',
    dataLoss:
      'La linea agganciata ha punti propri, quindi le marche temporali e i dati registrati dai sensori (frequenza cardiaca, cadenza, velocità) andranno persi.',
    run: 'Aggancia',
    tooLong: 'Questa traccia ha troppi punti per essere agganciata.',
    tooShort: 'La traccia è troppo corta per essere agganciata.',
    brokenSequence:
      'La traccia esce da qualche parte dalla rete mappata, quindi non può essere agganciata. Provi un altro mezzo oppure lasci la traccia com’è.',
    offNetwork:
      'Il percorso agganciato è risultato molto più lungo della traccia, il che significa che la traccia non seguiva percorsi mappati — attraverso un prato, ad esempio. L’aggancio può rispondere solo con percorsi esistenti, quindi il risultato non sarebbe dove è passato. La traccia resta invariata.',
    partial:
      'Alcune parti della traccia non sono state agganciate — restano come registrate. Una traccia che cambia mezzo a metà strada (una camminata, poi il rientro in auto) va prima divisa.',
  },
  info: () => <DataViewerDetails />,
  upload: 'Carica',
  unnamedTrack: ({ n }) => `Traccia ${n}`,
  simplifyAll: 'Semplifica tutto',
  moreInfo: 'Maggiori info',
  breakApart: 'Separa in parti',
  saveAsMap: 'Salva nelle mie mappe',
  loginToSaveMap: 'Acceda prima per salvare la traccia nelle sue mappe.',
  details: {
    startTime: 'Ora inizio',
    finishTime: 'Ora fine',
    duration: 'Durata',
    distance: 'Distanza',
    avgSpeed: 'Velocità media',
    minEle: 'Elevazione min.',
    maxEle: 'Elevazione max',
    uphill: 'Ascesa totale',
    downhill: 'Discesa totale',
    durationValue: ({ h, m }) => `${h} ore ${m} minuti`,
    source: 'Origine quota',
    sourceOriginal: 'registrata',
    sourcePartial: 'registrata, incompleta',
    sourceFilledGaps: 'registrata, lacune riempite (modello del terreno)',
    sourceFilled: 'modello del terreno',
  },
  uploadModal: {
    title: 'Importa file',
    drop: 'Trascini qui un file GPX, KML, KMZ, TCX o GeoJSON oppure clicchi per selezionarlo.',
    mergeTitle: 'Dati già caricati',
    mergeMessage:
      'Alcuni geodati sono già visualizzati. Aggiungere i dati importati o sostituirli?',
    existingData: 'Dati esistenti',
    append: 'Aggiungi',
    replace: 'Sostituisci',
  },
  trace: {
    streams: 'Tracciamento dei corsi d’acqua',
    forests: 'Tracciamento dei boschi',
    streamsHelp:
      'Serve a ricavare le linee dei corsi d’acqua dal modello del terreno ad alta risoluzione nel poligono selezionato. Adatto alla mappatura in OpenStreetMap.',
    forestsHelp:
      'Serve a tracciare le aree coperte dalle classi di punti LiDAR scelte nel poligono selezionato. Adatto soprattutto a mappare la copertura del suolo in OpenStreetMap.',
    pixelSize: 'Dimensione del pixel',
    pixelSizeHint: 'Vuoto per la risoluzione propria del modello del terreno.',
    threshold: 'Area minima del bacino',
    minLength: 'Lunghezza minima del corso d’acqua',
    simplify: 'Tolleranza di semplificazione',
    classes: 'Classi di punti',
    classNames: {
      lowVegetation: 'Vegetazione bassa',
      mediumVegetation: 'Vegetazione media',
      highVegetation: 'Vegetazione alta',
      building: 'Edifici',
      water: 'Acqua',
    },
    output: 'Risultato',
    outputJosm: 'Apri in JOSM',
    outputOsm: 'Scarica come OSM XML',
    outputGeojson: 'Scarica come GeoJSON',
    tooBig: ({ max }) => `Il poligono è troppo grande; il limite è ${max}.`,
    run: 'Traccia',
    legacy: ({ phrase, item }) => (
      <>
        Invece dell’<i>easter egg</i> <code>{phrase}</code>, usi la voce{' '}
        <i>{item}</i> nel menu ⋮ del poligono selezionato.
      </>
    ),
  },
  elevationFill: {
    title: 'Dati di quota',
    introNone: 'Non ci sono ancora dati di quota.',
    introPartial: 'In alcuni punti manca la quota.',
    introFull:
      'I dati di quota sono già presenti, ma un modello del terreno è spesso ' +
      'più preciso.',
    premiumHiRes: (premiumLink, countries) => (
      <>
        Con l’{premiumLink('accesso premium')}, in{' '}
        {countries('molti paesi europei')} la quota è campionata da modelli
        nazionali del terreno ad alta risoluzione.
      </>
    ),
    question: 'Cosa vuole fare?',
    overrideAll: 'Sovrascrivi tutto',
    overrideAllDesc:
      'sostituisce ogni punto con il modello del terreno — un profilo ' +
      'uniforme e coerente',
    fillMissing: 'Riempi mancanti',
    fillMissingDesc:
      'mantiene i valori registrati e riempie solo le lacune (potrebbero ' +
      'esserci scalini dove i due dati si incontrano)',
    keep: 'Non modificare',
    keepDesc: 'usa la quota memorizzata nella traccia',
    add: 'Aggiungi quota',
    update: 'Aggiorna quota',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'La quota mancante è stata riempita.'
        : mode === 'clear'
          ? 'La quota è stata rimossa.'
          : 'La quota è stata sovrascritta.',
    clear: 'Cancella quota',
    clearDesc:
      'rimuove la quota memorizzata; i profili la leggono poi dal modello del terreno',
  },
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore durante il recupero dei dati della traccia:',
      err,
    ),
  loadingError: 'Errore nel caricamento del file.',
  onlyOne: "E' atteso un singolo file.",
  invalidFormat: 'Il file non è in un formato supportato o non è valido.',
  someFilesFailed: ({ names }) => `Impossibile caricare alcuni file: ${names}.`,
  unsaved: 'Non salvata',
  unsavedTooltip:
    "Questi dati non possono stare nell'indirizzo della pagina (URL) e non sono in nessuna mappa salvata: restano solo in questo browser. Li salvi nelle sue mappe per conservarli.",
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Errore durante l’aggancio della traccia', err),
  snapshotGone:
    'I dati mostrati in questo passaggio non sono più conservati in questo browser.',
  snapshotFailed:
    'Questo browser non è riuscito a conservare i dati, quindi ricaricando la pagina andranno persi. Per conservarli, li salvi nelle sue mappe.',
  osmUploadError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore durante il caricamento su OpenStreetMap',
      err,
    ),
};

export default it;
