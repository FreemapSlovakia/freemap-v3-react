import { AlertLink } from 'react-bootstrap';
import { FaGem, FaKey } from 'react-icons/fa';
import { AreaInfo } from '../components/AreaInfo.js';
import { Attribution } from '../components/Attribution.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { CookieConsent } from '../components/CookieConsent.js';
import { DistanceInfo } from '../components/DistanceInfo.js';
import { ElevationInfo } from '../components/ElevationInfo.js';
import { MaptilerAttribution } from '../components/MaptilerAttribution.js';
import {
  ObjectDetailBasicProps,
  ObjectDetails,
} from '../components/ObjectDetails.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { DeepPartialWithRequiredObjects } from '../deepPartial.js';
import shared from './it-shared.js';
import { Messages, addError } from './messagesInterface.js';

const nf00 = new Intl.NumberFormat('it', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const masl = 'm\xa0a.s.l.';

const getErrorMarkup = (ticketId?: string) => `
<h1>Errore dell’applicazione!</h1>
<p>
  ${
    ticketId
      ? `L'errore è stato automaticamente segnalato con il Ticket numero (ID) <b>${ticketId}</b>.`
      : ''
  }
  Puoi segnalare il problema a <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a>,
  oppure inviare una email con i dettagli a <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
</p>
<p>
  Grazie.
</p>`;

const outdoorMap = 'Escursionismo, Ciclismo, Sci, Cavallo';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    iso: 'it_IT',
    elevationProfile: 'Profilo altimetrico',
    save: 'Salva',
    cancel: 'Annulla',
    modify: 'Modifica',
    delete: 'Elimina',
    remove: 'Rimuovi',
    close: 'Chiudi',
    apply: 'Applica',
    exitFullscreen: 'Esci dalla modalità a tutto schermo',
    fullscreen: 'Modalità a tutto schermo',
    yes: 'Sì',
    no: 'No',
    masl,
    copyCode: 'Copia codice',
    loading: 'Caricamento…',
    ok: 'OK',
    preventShowingAgain: 'Non mostrare più',
    closeWithoutSaving: 'Chiudere la finestra senza salvare?',
    back: 'Indietro',
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,

    processorError: ({ err }) =>
      addError(messages, "Errore dell'applicazione:", err),

    seconds: 'secondi',
    minutes: 'minuti',
    meters: 'metri',
    createdAt: 'Creato a',
    modifiedAt: 'Modificato a',
    actions: 'Azioni',
    add: 'Aggiungi nuovo',
    clear: 'Pulisci',
    convertToDrawing: 'Converti in disegno',

    simplifyPrompt:
      'Per favore inserisci il fattore di semplificazione. Imposta lo zero per nessuna semplificazione.',

    copyUrl: 'Copia URL',
    copyPageUrl: 'Copia URL della pagina',
    savingError: ({ err }) => addError(messages, "Salva l'errore:", err),
    loadError: ({ err }) => addError(messages, "Caricamento dell'errore:", err),

    deleteError: ({ err }) =>
      addError(messages, "Eliminazione dell'errore:", err),

    operationError: ({ err }) =>
      addError(messages, "Errore dell'operazione:", err),
    deleted: 'Eliminato.',
    saved: 'Salvato.',
    visual: 'Visualizza',
    copyOk: 'Copiato negli appunti.',
    noCookies: "Questa funzionalità richiede l'accettazione dei cookies.",
    name: 'Nome',
    load: 'Carica',
    unnamed: 'Nessun nome',
    enablePopup: 'Per favore abilita i popup nel tuo browser per questo sito.',
    componentLoadingError:
      'Errore di caricamento. Per favore verifica la tua connessione internet.',
    offline: 'Non sei connesso a internet.',
    connectionError: 'Errore di collegamento al server.',
    experimentalFunction: 'Funzione sperimentale',
    attribution: () => (
      <Attribution unknown="Licenza della mappa non specificata." />
    ),
    export: 'Esporta',
    expiration: 'Scadenza',
    unauthenticatedError: 'Accedi per utilizzare questa funzione.',
    areYouSure: 'Sei sicuro/a?',
    success: 'Fatto!',
    privacyPolicy: 'Informativa sulla privacy',
    newOptionText: 'Aggiungi %value%',
    deleteButtonText: 'Rimuovi %value% dalla lista',
  },

  theme: {
    light: 'Modalità chiara',
    dark: 'Modalità scura',
    auto: 'Modalità automatica',
  },

  selections: {
    objects: 'Oggetto (POI)',
    drawPoints: 'Punto',
    drawLines: 'Linea',
    drawPolygons: 'Poligono',
    tracking: 'Tracciamento',
    linePoint: 'Punto della linea',
    polygonPoint: 'Punto del poligono',
  },

  tools: {
    none: 'Chiudi lo strumento',
    routePlanner: 'Cerca percorso',
    objects: 'Oggetti (POI)',
    photos: 'Foto',
    measurement: 'Disegno e misurazione',
    drawPoints: 'Disegno a punti',
    drawLines: 'Disegno a linee',
    drawPolygons: 'Disegno a poligoni',
    trackViewer: 'Visualizzatore di tracce (GPX)',
    changesets: 'Modifiche mappa',
    mapDetails: 'Dettagli mappa',
    tracking: 'Tracciamento in tempo reale',
    maps: 'Le mie mappe',
  },

  routePlanner: {
    ghParams: {
      tripParameters: 'Parametri del viaggio',
      seed: 'Casuale',
      distance: 'Distanza approssimativa',
      isochroneParameters: 'Parametri isocroni',
      buckets: 'Buckets',
      timeLimit: 'Limite tempo',
      distanceLimit: 'Limite distanza',
    },
    milestones: 'Marcatori',
    start: 'Inizio',
    finish: 'Fine',
    swap: 'Inverti inizio e fine',
    point: {
      pick: 'Seleziona sulla mappa',
      current: 'La tua posizione',
      home: 'Posizione casa',
      point: 'Punto del percorso',
    },
    transportType: {
      car: 'Auto',
      car4wd: 'Auto 4x4',
      bike: 'Bici',
      foot: 'Camminata',
      hiking: 'Escursione',
      mtb: 'Mountain bike',
      racingbike: 'Bici da corsa',
      motorcycle: 'Moto',
    },
    development: 'in sviluppo',
    mode: {
      route: 'Ordinato',
      trip: 'Luoghi da visitare',
      roundtrip: 'Luoghi da visitare (Andata e ritorno)',
      'routndtrip-gh': 'Andata e ritorno',
      isochrone: 'Isocrono',
    },
    alternative: 'Alternativo',
    distance: ({ value, diff }) => (
      <>
        Distance:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Durata:{' '}
        <b>
          {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Distanza: <b>{distance}</b> | Durata:{' '}
        <b>
          {h} h {m} m
        </b>
      </>
    ),
    noHomeAlert: {
      msg: 'Devi prima impostare la tua posizione di casa nelle Opzioni.',
      setHome: 'Imposta',
    },
    showMidpointHint:
      'Per aggiungere un punto intermedio, trascina un punto della linea.',
    gpsError: 'Errore nel determinare la tua posizione corrente.',
    routeNotFound:
      'Nessun percorso trovato. Prova a cambiare i parametri o sposta i punti della rotta.',
    fetchingError: ({ err }) =>
      addError(messages, 'Error finding the route:', err),
    manual: 'Manuale',
    manualTooltip: 'Collega il segmento successivo con una linea retta',
  },

  mainMenu: {
    title: 'Menu principale',
    logOut: 'Esci',
    logIn: 'Accedi',
    account: 'Account',
    mapFeaturesExport: 'Esportazione delle caratteristiche della mappa',
    mapExports: 'Mappa per apparati GPS',
    embedMap: 'Incorpora la mappa',
    supportUs: 'Supporta Freemap',
    help: 'Info e aiuto',
    back: 'Indietro',
    mapLegend: 'Legenda',
    contacts: 'Contatti',
    facebook: 'Freemap su Facebook',
    twitter: 'Freemap su Twitter',
    youtube: 'Freemap su YouTube',
    github: 'Freemap su GitHub',
    automaticLanguage: 'Automatico',
    mapExport: 'Esporta la mappa',
    osmWiki: 'Documentazione su OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Main_Page',
  },

  main: {
    title: shared.title,
    description: shared.description,
    clearMap: 'Pulisci la mappa',
    close: 'Chiudi',
    closeTool: 'Chiudi lo strumento',
    locateMe: 'Localizzami',
    locationError: 'Errore nel determinare la locazione.',
    zoomIn: 'Zoom avanti',
    zoomOut: 'Zoom indietro',
    devInfo: () => (
      <div>
        Questa è una versione di test di Freemap Slovakia. Per la versione
        effettiva vai a <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Copyright',
    cookieConsent: () => (
      <CookieConsent
        prompt="Alcune funzionalità richiedono i cookies. Accetta:"
        local="Cookies su impostazioni locali e accesso tramite social networks"
        analytics="Cookies analitici"
      />
    ),
    infoBars: {
      // ua: () => (
      //   <>
      //     <Emoji>🇺🇦</Emoji>&ensp;Siamo con l'Ucraina.{' '}
      //     <AlertLink
      //       href="https://bank.gov.ua/en/about/support-the-armed-forces"
      //       target="_blank"
      //       rel="noopener"
      //     >
      //       Fai una donazione all\'esercito ucraino ›
      //     </AlertLink>
      //     &ensp;
      //     <Emoji>🇺🇦</Emoji>
      //   </>
      // ),
    },
    ad: (email) => (
      <>
        Vuoi pubblicare il tuo annuncio qui? Non esitare a contattarci a {email}
        .
      </>
    ),
  },

  gallery: {
    legend: 'Legenda',
    filter: 'Filtro',
    showPhotosFrom: 'Vedi le foto',
    showLayer: 'Mostra il livello',
    upload: 'Carica',

    f: {
      '-createdAt': 'dagli ultimi caricati',
      '-takenAt': 'dai più recenti',
      '-rating': 'dai più valutati',
      '-lastCommentedAt': "dall'ultimo commento",
    },

    colorizeBy: 'Colora in base',
    showDirection: 'Mostra la direzione dello scatto',

    c: {
      disable: 'Non colorare',
      mine: 'Diversi dai miei',
      userId: 'Autore',
      rating: 'Valutazioni',
      takenAt: 'Data scatto',
      createdAt: 'Data di caricamento',
      season: 'Stagione',
      premium: 'Premium',
    },

    viewer: {
      title: 'Foto',
      comments: 'Commenti',
      newComment: 'Nuovo commento',
      addComment: 'Aggiungi',
      yourRating: 'La tua valutazione:',
      showOnTheMap: 'Mostra sulla mappa',
      openInNewWindow: 'Apri in…',
      uploaded: ({ username, createdAt }) => (
        <>
          Caricato da {username} il {createdAt}
        </>
      ),
      captured: (takenAt) => <>Captured on {takenAt}</>,
      deletePrompt: 'Eliminare questa foto?',
      modify: 'Modifica',
      premiumOnly:
        'Questa foto è stata resa disponibile dal suo autore solo agli utenti con accesso premium.',
      noComments: 'Nessun commento',
    },

    editForm: {
      name: 'Nome',
      description: 'Descrizione',
      takenAt: {
        datetime: 'Data e ora dello scatto',
        date: 'Data scatto',
        time: 'Orario scatto',
      },
      location: 'Luogo',
      azimuth: 'Azimut',
      tags: 'Tag',
      setLocation: 'Imposta il luogo',
    },

    uploadModal: {
      title: 'Carica foto',
      uploading: (n) => `Uploading (${n})`,
      upload: 'Carica',
      rules: `
        <p>Trascina qui le tue foto o clicca qui per selezionarle.</p>
        <ul>
          <li>Non caricare foto troppo piccole (diapositive). Le dimensioni massime non sono limitate. La dimensione massima del file è limitata a 10 MB. I file più grandi saranno respinti.</li>
          <li>Carica soltanto foto di panorami o di documentazione. I ritratti e le macro non sono accettate e saranno eliminate senza preavviso.</li>
          <li>Carica soltanto foto scattate da te e di tua proprietà.</li>
          <li>Didascalie o commenti che non si riferiscono direttamente al contenuto delle foto caricate o che contraddicono i principi generalmente accettati di convivenza civile verranno rimossi. I trasgressori di questa regola saranno avvisati e, in caso di ripetute violazioni, il loro account nell'applicazione potrebbe essere cancellato.</li>
          <li>Caricando le foto, accetti che esse saranno distribuite secondo i termini di licenza CC BY-SA 4.0.</li>
          <li>L'operatore (Freemap.sk) declina ogni responsabilità e non risponde per danni diretti o indiretti derivanti dalla pubblicazione di una foto in galleria. La persona che ha caricato l'immagine sul server è pienamente responsabile della foto.</li>
          <li>L'operatore si riserva il diritto di modificare la descrizione, il nome, la posizione e i tag della foto, o di eliminare la foto se il contenuto è inappropriato (in violazione di queste regole).</li>
          <li>L'operatore si riserva il diritto di eliminare l'account nel caso in cui l'utente violi ripetutamente la politica della galleria pubblicando contenuti inappropriati.</li>
        </ul>
      `,
      success: 'Le foto sono state caricate con successo.',
      showPreview:
        "Mostra automaticamente l'anteprima (aumenta il consumo di CPU e memoria)",
      premium: 'Disponibile solo per gli utenti con accesso completo',
      loadPreview: 'Carica anteprima',
    },

    locationPicking: {
      title: "Selezione l'ubicazione della foto",
    },

    deletingError: ({ err }) =>
      addError(messages, 'Error deleting photo:', err),

    tagsFetchingError: ({ err }) =>
      addError(messages, 'Error fetching tags:', err),

    pictureFetchingError: ({ err }) =>
      addError(messages, 'Error fetching photo:', err),

    picturesFetchingError: ({ err }) =>
      addError(messages, 'Error fetching photos:', err),

    savingError: ({ err }) => addError(messages, 'Error saving photo:', err),

    commentAddingError: ({ err }) =>
      addError(messages, 'Error adding comment:', err),

    ratingError: ({ err }) => addError(messages, 'Error rating photo:', err),
    missingPositionError: 'Luogo mancante.',
    invalidPositionError: 'Formato coordinate di posizione non valide.',
    invalidTakenAt: 'Data e orario di scatto non valide.',

    filterModal: {
      title: 'Filtro foto',
      tag: 'Tag',
      createdAt: 'Data di caricamento',
      takenAt: 'Data di scatto',
      author: 'Autore',
      rating: 'Valutazione',
      noTags: 'no tag',
      pano: 'Panorama',
      premium: 'Premium',
    },

    noPicturesFound: 'Non è stata trovata nessuna foto in questo posto.',
    linkToWww: 'foto su www.freemap.sk',
    linkToImage: 'file immagine',
    showLegend: 'Mostra la legenda della colorazione',

    allMyPhotos: {
      premium: 'Includi tutte le mie foto nei contenuti premium',
      free: 'Rendi tutte le mie foto accessibili a tutti',
    },

    recentTags: 'Tag recenti da assegnare:',
  },

  measurement: {
    distance: 'Linea',
    elevation: 'Punto',
    area: 'Poligono',
    elevationFetchError: ({ err }) =>
      addError(messages, 'Error fetching point elevation:', err),
    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="cs"
        tileMessage="Tile"
        maslMessage="Elevazione"
      />
    ),
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Area" perimeterLabel="Perimetro" />
    ),
    distanceInfo: (props) => (
      <DistanceInfo {...props} lengthLabel="Lunghezza" />
    ),
  },

  trackViewer: {
    upload: 'Carica',
    moreInfo: 'Maggiori info',
    share: 'Salva sul Server',
    colorizingMode: {
      none: 'Inattivo',
      elevation: 'Elevazione',
      steepness: 'Ripidezza',
    },
    details: {
      startTime: 'Ora inizio',
      finishTime: 'Ora fine',
      duration: 'Durata',
      distance: 'Distanza',
      avgSpeed: 'Velocità media',
      minEle: 'Elevazione min.',
      maxEle: 'Elevazione max',
      uphill: 'Acesca totale',
      downhill: 'Discesa totale',
      durationValue: ({ h, m }) => `${h} ore ${m} minuti`,
    },
    uploadModal: {
      title: 'Carica la traccia',
      drop: 'Trascina qui il tuo file GPX oppure clicca per selezionarlo.',
    },
    shareToast:
      "La traccia è stata salvata sul server e può essere condivisa copiando l'URL della pagina.",
    fetchingError: ({ err }) =>
      addError(
        messages,
        'Errore durante il recupero dei dati della traccia:',
        err,
      ),
    savingError: ({ err }) =>
      addError(messages, 'Errore nel salvataggio della traccia:', err),
    loadingError: 'Errore nel caricamento del file.',
    onlyOne: "E' atteso un singolo file GPX.",
    wrongFormat: 'Il file deve avere estensione .GPX.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Il file è troppo grande.',
  },

  drawing: {
    modify: 'Proprietà',
    edit: {
      title: 'Proprietà',
      color: 'Colore',
      label: 'Etichetta',
      width: 'Larghezza',
      hint: "Per rimuovere l'etichetta lascia il campo vuoto.",
      type: 'Tipo di geometria',
    },
    continue: 'Continua',
    join: 'Unisci',
    split: 'Separa',
    stopDrawing: 'Ferma il disegno',
    selectPointToJoin: 'Seleziona un punto per unire le linee',
    defProps: {
      menuItem: 'Impostazioni stile',
      title: 'Impostazioni dello stile di disegno',
      applyToAll: 'Salva e applica a tutti',
    },

    projection: {
      projectPoint: 'Proietta punto',
      distance: 'Distanza',
      azimuth: 'Azimut',
    },
  },

  purchases: {
    purchases: 'Acquisti',
    premiumExpired: (at) => <>Il tuo accesso premium è scaduto il {at}</>,
    date: 'Data',
    item: 'Elemento',
    notPremiumYet: 'Non hai ancora un accesso premium.',
    noPurchases: 'Nessun acquisto',
    premium: 'Premium',
    credits: (amount) => <>Crediti ({amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Posizione di casa:',
        select: 'Seleziona sulla mappa',
        undefined: 'indefinito',
      },
    },
    account: {
      name: 'Nome',
      email: 'Email',
      sendGalleryEmails: 'Notifica i commenti alle foto via email',
      personalInfo: 'Dati personali',
      authProviders: 'Provider di accesso',
      delete: 'Elimina account',
      deleteWarning:
        'Sei sicuro di voler eliminare il tuo account? Verranno rimossi tutte le tue foto, i commenti e le valutazioni delle foto, le tue mappe e i dispositivi monitorati.',
    },
    general: {
      tips: "Mostra i consigli all'apertura della pagina (solo se è selezionata la lingua ceca o slovacca)",
    },
    layer: 'Livello',
    overlayOpacity: 'Opacità',
    showInMenu: 'Mostra nel menu',
    showInToolbar: 'Mostra nella barra degli strumenti',
    saveSuccess: 'Impostazioni salvate.',
    savingError: ({ err }) =>
      addError(messages, 'Errore nel salvataggio delle impostazioni:', err),
    customLayersDef: 'Definizione di livelli mappa personalizzati',
    customLayersDefError:
      'Definizione di livelli mappa personalizzati non valida.',
  },

  changesets: {
    allAuthors: 'Tutti gli autori',
    tooBig:
      'La richiesta dei changeset potrebbe restituire troppi risultati. Per favore aumenta lo zoom, scegli meno giorni o inserici un autore specifico.',
    olderThan: ({ days }) => `${days} giorni`,
    olderThanFull: ({ days }) => `Changeset degli ultimi ${days} giorni`,
    notFound: 'Nessun changeset trovato.',
    fetchError: ({ err }) =>
      addError(messages, 'Errore nel recupero dei changeset:', err),
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
    details: {
      author: 'Autore:',
      description: 'Descrizione:',
      noDescription: 'senza descrizione',
      closedAt: 'Ora:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          Maggiori dettagli su {osmLink} o {achaviLink}.
        </p>
      ),
    },
  },

  mapDetails: {
    sourceItems: {
      reverse: 'Geocodifica inversa',
      nearby: 'Oggetti vicini',
      surrounding: 'Oggetti contenenti',
    },
    notFound: 'Niente trovato qui.',
    fetchingError: ({ err }) =>
      addError(messages, 'Errore durante il recupero dei dettagli', err),
    detail: (props: ObjectDetailBasicProps) => (
      <ObjectDetails
        {...props}
        openText="Apri su OpenStreetMap.org"
        historyText="storia"
        editInJosmText="Modifica su JOSM"
      />
    ),
    sources: 'Fonti',
  },

  objects: {
    type: 'Tipo',
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Per vedere gli oggetti in base al loro tipo, devi ingrandire almeno al livello ${minZoom}.`,
      zoom: 'Zoom-in',
    },
    tooManyPoints: ({ limit }) => `Risultato limitato a ${limit} oggetti.`,
    fetchingError: ({ err }) =>
      addError(messages, 'Errore nel recupero degli oggetti (POI):', err),
    icon: {
      pin: 'Segnaposto',
      ring: "Dell'anello",
      square: 'Quadrata',
    },
  },

  external: {
    openInExternal: 'Condividi / Apri su altra App.',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Maps',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.com',
    josm: 'Modifica con JOSM',
    id: 'Modifica con iD',
    window: 'Nuova finestra',
    url: 'Condividi URL',
    image: 'Condividi foto',
  },

  search: {
    inProgress: 'Ricerca in corso…',
    noResults: 'Nessun risultato trovato',
    prompt: 'Inserisci il luogo',
    routeFrom: 'Percorso da qui',
    routeTo: 'Percorso fino a qui',
    fetchingError: ({ err }) => addError(messages, 'Searching error:', err),
    buttonTitle: 'Cerca',
    placeholder: 'Cerca sulla mappa',
    result: 'Risultato',
  },

  embed: {
    code: 'Inserisci il codice seguente nella tua pagina HTML:',
    example: 'Il risultato sarà simile a questo:',
    dimensions: 'Dimensioni',
    height: 'Altezza',
    width: 'Larghezza',
    enableFeatures: 'Abilita caratteristiche',
    enableSearch: 'cerca',
    enableMapSwitch: 'Cambia livello mappa',
    enableLocateMe: 'trovami',
  },

  documents: {
    errorLoading: 'Errore caricamento documento.',
  },

  exportMapFeatures: {
    download: 'Download',
    format: 'Formato',
    exportError: ({ err }) => addError(messages, 'Error exporting:', err),

    what: {
      plannedRoute: 'trova percorso',
      plannedRouteWithStops: 'incluse fermate',
      objects: 'oggetti (POI)',
      pictures: 'foto (area di mappa visibile)',
      drawingLines: 'disegno - linee',
      drawingAreas: 'disegno - poligoni',
      drawingPoints: 'disegno - punti',
      tracking: 'tracciamento in tempo reale',
      gpx: 'traccia GPX',
      search: 'elemento della mappa evidenziato',
    },

    disabledAlert:
      'Sono abilitate solo i checkbox che hanno qualcosa nella mappa da esportare.',

    licenseAlert:
      'Possono essere applicate varie licenze, come OpenStreetMap. Aggiungi le attribuzioni mancanti durante la condivisione del file esportato.',

    exportedToDropbox: 'Il file è stato salvato su Dropbox.',
    exportedToGdrive: 'Il file è stato salvato su Google Drive.',

    garmin: {
      courseName: 'Nome del corso',
      description: 'Descrizione',
      activityType: 'Tipo di attività',
      at: {
        running: 'Corsa',
        hiking: 'Escursionismo',
        other: 'Altro',
        mountain_biking: 'Mountain bike',
        trailRunning: 'Corsa su sentiero',
        roadCycling: 'Ciclismo su strada',
        gravelCycling: 'Ciclismo su ghiaia',
      },
      revoked: "L'esportazione del corso su Garmin è stata revocata.",
      connectPrompt:
        'Non hai ancora collegato il tuo account Garmin. Vuoi collegarlo ora?',
      authPrompt:
        "Non hai ancora effettuato l'accesso a Garminon. Vuoi accedere questa volta?",
    },
    target: 'Destinazione',
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
    logIn: {
      with: 'Scegli un provider di accesso',
      success: 'Accesso eseguito correttamente.',
      logInError: ({ err }) => addError(messages, 'Error logging in:', err),
      logInError2: 'Error logging in.',
      verifyError: ({ err }) =>
        addError(messages, 'Error verifying authentication:', err),
    },
    logOut: {
      success: 'Disconnessione avvenuta correttamente.',
      error: ({ err }) => addError(messages, 'Error logging out:', err),
    },
    connect: {
      label: 'Connetti',
      success: 'Connesso',
    },
    disconnect: {
      label: 'Disconnetti',
      success: 'Disconnesso',
    },
  },

  mapLayers: {
    showAll: 'Mostra tutti i livelli',
    settings: 'Impostazioni livelli mappa',
    layers: 'Livelli mappa',
    switch: 'Livelli mappa',
    photoFilterWarning: 'Il filtro foto è attivo',
    interactiveLayerWarning: 'Il livello interattivo è nascosto',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    letters: {
      A: 'Auto',
      T: 'Escursione',
      C: 'Bici',
      K: 'Sci di fondo',
      S: 'Aereo',
      Z: 'Aereo',
      J1: 'Ortofotomozaika SR (1° ciclo)',
      J2: 'Ortofotomozaika SR (2° ciclo)',
      O: 'OpenStreetMap',
      d: 'Trasporti pubblici (ÖPNV)',
      X: outdoorMap,
      i: 'Livello interattivo',
      I: 'Foto',
      l: 'Forest tracks NLC',
      t: 'Percorsi escursionistici',
      c: 'Percorsi ciclistici',
      s0: 'Strava (tutti)',
      s1: 'Strava (bici)',
      s2: 'Strava (corsa)',
      s3: 'Strava (sport acquatici)',
      s4: 'Strava (sport invernali)',
      w: 'Wikipedia',
      '5': 'Ombreggiatura del terreno',
      '6': 'Ombreggiatura della superficie',
      '7': 'Ombreggiatura dettagliata della terreno',
      '8': 'Ombreggiatura dettagliata della terreno',

      VO: 'OpenStreetMap Vettoriale',
      VS: 'Strade Vettoriale',
      VD: 'Dataviz Vettoriale',
      VT: 'Outdoor Vettoriale',

      h: 'Ombreggiatura parametrica',
      z: 'Ombreggiatura parametrica',
    },
    customBase: 'Mappa personalizzata',
    type: {
      map: 'mappa',
      data: 'data',
      photos: 'foto',
    },
    attr: {
      osmData: '© contributori di OpenStreetMap',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Tasselli vettoriali da"
          hostedBy="ospitato da"
        />
      ),
    },
    customMaps: 'Mappe personalizzate',
    base: 'Livelli di base',
    overlay: 'Livelli sovrapposti',
    url: 'Modello URL',
    minZoom: 'Zoom minimo',
    maxNativeZoom: 'Zoom nativo massimo',
    extraScales: 'Risoluzioni extra',
    scaleWithDpi: 'Scala con DPI',
    zIndex: 'Z-Index',
    generalSettings: 'Impostazioni generali',
    maxZoom: 'Zoom massimo',
    layer: {
      layer: 'Livello',
      base: 'Base',
      overlay: 'Sovrapposto',
    },
    showMore: 'Mostra più mappe',
    countryWarning: (countries) =>
      `Copre solo i seguenti paesi: ${countries.join(', ')}`,
    layerSettings: 'Livelli mappa',
    technologies: {
      tile: 'Riquadri immagine (TMS, XYZ)',
      maplibre: 'Vettore (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Ombreggiatura parametrica',
    },
    technology: 'Tipo',
    loadWmsLayers: 'Carica livelli',
  },

  elevationChart: {
    distance: 'Distanza [km]',
    ele: `Elevation [${masl}]`,
    fetchError: ({ err }) =>
      addError(messages, 'Error fetching elevation profile data:', err),
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
      <p>
        Puoi provare:
      </p>
      <ul>
        <li><a href="">ricaricare ultima pagina</a></li>
        <li><a href="/">caricare pagina iniziale</a></li>
        <li><a href="/#reset-local-storage">pulire dati locali e caricare pagina iniziale</a></li>
      </ul>
    `,
  },

  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Errore durante il recupero dei dati OSM', err),
  },

  tracking: {
    trackedDevices: {
      button: 'Visto',
      modalTitle: 'Dispositivi visti',
      desc: 'Gestisci i dispositivi viti per vedere la posizione dei tuoi amici.',
      modifyTitle: (name) => (
        <>
          Modifica nome dispositivo <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          Vedi dispositivo <i>{name}</i>
        </>
      ),
      storageWarning:
        "Tieni presente che l'elenco dei dispositivi si riflette solo nell'URL della pagina. Se vuoi salvarlo, usa la funzione 'Le mie mappe'.",
    },
    accessToken: {
      token: 'Watch Token',
      timeFrom: 'Da',
      timeTo: 'A',
      listingLabel: 'Etichetta inserzione',
      note: 'Note',
      delete: 'Eliminare il token?',
    },
    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          Watch Tokens per <i>{deviceName}</i>
        </>
      ),
      desc: (deviceName) => (
        <>
          Definisci gli watch token per condividere la posizione del tuo
          dispositivo <i>{deviceName}</i> con i tuoi amici.
        </>
      ),
      createTitle: (deviceName) => (
        <>
          Aggiungi Watch Token per <i>{deviceName}</i>
        </>
      ),
      modifyTitle: ({ token, deviceName }) => (
        <>
          Modifica Watch Token <i>{token}</i> per <i>{deviceName}</i>
        </>
      ),
    },
    trackedDevice: {
      token: 'Watch Token',
      label: 'Etichetta',
      fromTime: 'Da',
      maxAge: 'Durata Massima',
      maxCount: 'Conteggio massimo',
      splitDistance: 'Dividi distanza',
      splitDuration: 'Divita durata',
      color: 'Colore',
      width: 'Larghezza',
    },
    devices: {
      button: 'Miei dispositivi',
      modalTitle: 'Miei dispositivi tracciati',
      createTitle: 'Crea dispositivo di tracciamento',
      watchTokens: 'Watch token',
      watchPrivately: 'Guarda privatamente',
      watch: 'Guarda',
      delete: 'Eliminare dispositivo?',
      modifyTitle: ({ name }) => (
        <>
          Modifica dispositivo di tracciamento <i>{name}</i>
        </>
      ),
      desc: () => (
        <>
          <p>
            Gestisci i tuoi dispositivi in modo che gli altri possano vedere la
            tua posizione se loro il token (puoi crearlo tramite <FaKey /> ).
          </p>
          <hr />
          <p>
            Inserisci questo URL sul tuo tracker (eg.{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            o OsmAnd):{' '}
            <code>
              {process.env['API_URL']}/tracking/track/<i>token</i>
            </code>{' '}
            dove <i>token</i> è elencato nella tabella sotto.
          </p>
          <p>
            L\'endpoint supporta HTTP<code>GET</code> o <code>POST</code>
            con i parametri codificati URL:
          </p>
          <ul>
            <li>
              <code>lat</code> - latitudine in gradi (obbligatoria)
            </li>
            <li>
              <code>lon</code> - longitudine in gradi (obbligatoria)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> - datetime parsabile in
              JavaScript o time Unix in s o ms
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> - altitudine in metri
            </li>
            <li>
              <code>speed</code> - velocità in m/s
            </li>
            <li>
              <code>speedKmh</code> - velocità in km/h
            </li>
            <li>
              <code>acc</code> - precisione in metri
            </li>
            <li>
              <code>hdop</code> - DOP orizzontale
            </li>
            <li>
              <code>bearing</code> - gradi
            </li>
            <li>
              <code>battery</code> - batteria in percentuale
            </li>
            <li>
              <code>gsm_signal</code> - Segnale GSM in percentuale
            </li>
            <li>
              <code>message</code> - messagggio (note)
            </li>
          </ul>
          <hr />
          <p>
            In caso di dispositivo TK102B, configura il suo indirizzo come{' '}
            <code>
              {process.env['API_URL']
                ?.replace(/https?:\/\//, '')
                ?.replace(/:\d+$/, '')}
              :3030
            </code>
          </p>
        </>
      ),
    },
    device: {
      token: 'Token di traccia',
      name: 'Nome',
      maxAge: 'Durata massima',
      maxCount: 'Conteggio massimo',
      generatedToken: 'sarà rigenerato al salvataggio',
    },
    visual: {
      line: 'Linea',
      points: 'Punti',
      'line+points': 'Linea + Punti',
    },
    subscribeNotFound: ({ id }) => (
      <>
        Il token <i>{id}</i> non esiste.
      </>
    ),
    subscribeError: ({ id }) => (
      <>
        Errore nell'utilizzo del token <i>{id}</i>.
      </>
    ),
  },
  mapExport: {
    advancedSettings: 'Opzioni avanzate',
    styles: 'Stili livelli interattivi',
    exportError: ({ err }) => addError(messages, 'Error exporting map:', err),
    exporting: 'Attendere prego, esportazione in corso…',
    exported: ({ url }) => (
      <>
        Esportazione mappa completata.{' '}
        <AlertLink href={url} target="_blank">
          Aprire.
        </AlertLink>
      </>
    ),
    area: 'Esporta area',
    areas: {
      visible: 'Area visibile della mappa',
      pinned: 'Area contenente i poligoni selezionati (disegno)',
    },
    format: 'Formato',
    layersTitle: 'Livelli opzionali',
    layers: {
      contours: 'Curve di livello',
      shading: 'Rilievi ombreggiati',
      hikingTrails: 'Percorsi escursionistici',
      bicycleTrails: 'Percorsi ciclistici',
      skiTrails: 'Percorsi sciistici',
      horseTrails: 'Percorsi a cavallo',
      drawing: 'Disegno',
      plannedRoute: 'Trova percorso',
      track: 'Traccia GPX',
    },
    mapScale: 'Risoluzione mappa',
    alert: (licence) => (
      <>
        Note:
        <ul>
          <li>
            Sarà esportata la mappa <i>{outdoorMap}</i> .
          </li>
          <li>L\'esportazione della mappa potrebbe durare diversi secondi.</li>
          <li>
            Prima di condividere la mappa esportata, aggiungi la seguente
            attribuzione:
            <br />
            <em>{licence}</em>
          </li>
        </ul>{' '}
      </>
    ),
  },

  maps: {
    legacy: 'legacy',
    legacyMapWarning: ({ from, to }) => (
      <>
        La mappa visualizzata <b>{messages.mapLayers.letters[from]}</b> è
        legacy. Passare alla moderna <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
    noMapFound: 'Nessuna mappa trovata',
    save: 'Salva',
    delete: 'Elimina',
    disconnect: 'Disconnetti',
    deleteConfirm: (name) => `Sicuro di cancellare la mappa ${name}?`,
    fetchError: ({ err }) =>
      addError(messages, 'Errore caricando la mappa:', err),
    fetchListError: ({ err }) =>
      addError(messages, 'Errore caricando le mappe:', err),
    deleteError: ({ err }) =>
      addError(messages, 'Errore eliminando la mappa:', err),
    renameError: ({ err }) =>
      addError(messages, 'Errore rinominando la mappa:', err),
    createError: ({ err }) =>
      addError(messages, 'Errore salvando la mappa:', err),
    saveError: ({ err }) =>
      addError(messages, 'Errore salvando la mappa:', err),
    loadToEmpty: 'Carica su mappa vuota',
    loadInclMapAndPosition:
      'Carica inclusa la mappa di sfondo salvata e la sua posizione',
    savedMaps: 'Mappe salvate',
    newMap: 'Nuova mappa',
    SomeMap: ({ name }) => (
      <>
        Mappa <i>{name}</i>
      </>
    ),
    writers: 'Editori',
    conflictError: 'La mappa è stata modificata nel frattempo.',
    addWriter: 'Aggiungi editor',
  },

  mapCtxMenu: {
    centerMap: 'Centra la mappa qui',
    measurePosition: 'Trova coordinate e altitudine',
    addPoint: 'Aggiungi un punto qui',
    startLine: 'Inizia qui a disegnare una linea o misurazione',
    queryFeatures: 'Interroga le caratteristiche nelle vicinanze',
    startRoute: 'Pianifica una rotta da qui',
    finishRoute: 'Pianifica una rotta fino qui',
    showPhotos: 'Mostra le foto vicine',
  },

  legend: {
    body: ({ name }) => (
      <>
        Legenda mappa per <i>{name}</i>
      </>
    ),
  },

  contacts: {
    ngo: 'Associazione di volontari',
    registered: 'Registrata a MV/VVS/1-900/90-34343 on 2009-10-02',
    bankAccount: 'Conto bancario',
    generalContact: 'Contatti generali',
    board: 'Consiglio direttivo',
    boardMemebers: 'Membri del consiglio',
    president: 'Presidente',
    vicepresident: 'Vice Presidente',
    secretary: 'Segretario',
  },

  premium: {
    title: 'Ottieni accesso premium',
    commonHeader: (
      <>
        <p>
          <strong>Sostieni i volontari che creano questa mappa!</strong>
        </p>
        <p>
          Con <b>8 ore</b> di lavoro volontario oppure <b>8 €</b> otterrai un
          anno di accesso con:
        </p>
        <ul>
          <li>rimozione del banner pubblicitario</li>
          <li>
            accesso ai livelli mappa <FaGem /> premium
          </li>
          <li>
            accesso alle foto <FaGem /> premium
          </li>
        </ul>
      </>
    ),
    stepsForAnonymous: (
      <>
        <div className="fw-bold">Procedura</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Passo 1</span> - crea un account qui
            in Freemap (sotto)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Passo 2</span> - nell'applicazione
            Rovas, dove ti indirizzeremo dopo la registrazione, inviaci il
            pagamento.
          </p>
        </div>
      </>
    ),
    commonFooter: (
      <p>
        Puoi provare il tuo lavoro di volontariato creando rapporti di lavoro
        con l'applicazione <a href="https://rovas.app/">Rovas</a>. Se sei un
        volontario nel progetto OSM e stai utilizzando JOSM, ti raccomandiamo di
        abilitare il{' '}
        <a href="https://josm.openstreetmap.de/wiki/Help/Plugin/RovasConnector">
          plugin Rovas Connector
        </a>
        , che può creare rapporti di lavoro per te. Dopo che un rapporto è stato
        verificato da due utenti, riceverai la valuta comunitaria <i>Chron</i>,
        che puoi utilizzare per ottenere l'accesso premium a www.freemap.sk o
        acquistare crediti, che potrai usare per rimuovere gli annunci da
        www.freemap.sk.
      </p>
    ),
    continue: 'Continua',
    success: 'Congratulazioni, hai ottenuto l’accesso premium!',
    becomePremium: 'Ottieni accesso premium',
    youArePremium: (date) => (
      <>
        Hai accesso premium fino al <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Disponibile solo con accesso premium.',
    alreadyPremium: 'Hai già accesso premium.',
  },

  credits: {
    buyCredits: 'Acquista crediti',
    amount: 'Crediti',
    credits: 'crediti',
    buy: 'Acquista',
    purchase: {
      success: ({ amount }) => (
        <>Il tuo credito è stato aumentato di {nf00.format(amount)}.</>
      ),
    },
    youHaveCredits: (amount) => <>Hai {amount} crediti.</>,
  },

  offline: {
    offlineMode: 'Modalità Offline',
    cachingActive: 'Cache attiva',
    clearCache: 'Pulisci la cache',
    dataSource: 'Origine dati',
    networkOnly: 'Solo rete',
    networkFirst: 'Prima la rete',
    cacheFirst: 'Prima la cache',
    cacheOnly: 'Solo cache',
  },

  errorStatus: {
    100: 'Continua',
    101: 'Cambio Protocollo',
    102: 'Elaborazione',
    103: 'Anteprima informazioni',
    200: 'OK',
    201: 'Creato',
    202: 'Accettato',
    203: 'Informazioni non autorevoli',
    204: 'Nessun contenuto',
    205: 'Reset contenuto',
    206: 'Contenuto parziale',
    207: 'Stato multiplo',
    208: 'Già segnalato',
    226: 'IM usato',
    300: 'Multiple scelte',
    301: 'Spostato permanentemente',
    302: 'Trovato',
    303: 'Vedi altro',
    304: 'Non modificato',
    305: 'Usa proxy',
    306: 'Cambia proxy',
    307: 'Reindirizzamento temporaneo',
    308: 'Reindirizzamento permanente',
    400: 'Richiesta errata',
    401: 'Non autorizzato',
    402: 'Pagamento richiesto',
    403: 'Vietato',
    404: 'Non trovato',
    405: 'Metodo non consentito',
    406: 'Non accettabile',
    407: 'Autenticazione proxy richiesta',
    408: 'Timeout della richiesta',
    409: 'Conflitto',
    410: 'Gone',
    411: 'Lunghezza richiesta',
    412: 'Precondizione fallita',
    413: 'Payload troppo grande',
    414: 'URI troppo lungo',
    415: 'Tipo di media non supportato',
    416: 'Intervallo non soddisfacente',
    417: 'Aspettativa fallita',
    418: 'Sono una teiera',
    421: 'Richiesta mal indirizzata',
    422: 'Entità non elaborabile',
    423: 'Bloccato',
    424: 'Fallimento della dipendenza',
    425: 'Troppo presto',
    426: "È necessario l'aggiornamento",
    428: 'Precondizione richiesta',
    429: 'Troppe richieste',
    431: 'Intestazioni di richiesta troppo grandi',
    451: 'Non disponibile per motivi legali',
    500: 'Errore interno del server',
    501: 'Non implementato',
    502: 'Bad Gateway',
    503: 'Servizio non disponibile',
    504: 'Gateway Timeout',
    505: 'Versione HTTP non supportata',
    506: 'Negoziazione Variante',
    507: 'Archiviazione insufficiente',
    508: 'Rilevato loop',
    510: 'Non esteso',
    511: 'Autenticazione di rete necessaria',
  },
  gpu: {
    lost: 'Il dispositivo GPU è andato perso: ',
    noAdapter: "L'adattatore WebGPU non è disponibile in questo browser.",
    notSupported: 'WebGPU non è supportato in questo browser.',
    errorRequestingDevice: 'Impossibile creare il dispositivo GPU: ',
    other: 'Errore durante il rendering: ',
  },
  downloadMap: {
    downloadMap: 'Scarica mappa',
    format: 'Formato',
    map: 'Mappa',
    downloadArea: 'Scarica',
    area: {
      visible: 'Area visibile',
      byPolygon: 'Area coperta dal poligono selezionato',
    },
    name: 'Nome',
    zoomRange: 'Intervallo di zoom',
    scale: 'Scala',
    email: 'Il tuo indirizzo email',
    emailInfo:
      'Utilizzeremo la tua email per inviarti il link per il download.',
    download: 'Scarica',
    success:
      'La mappa è in preparazione. Al termine, riceverai via email un link per scaricarla.',
    summaryTiles: 'Riquadri',
    summaryPrice: (amount) => <>Prezzo totale: {amount} crediti</>,
  },
};

export default messages;
