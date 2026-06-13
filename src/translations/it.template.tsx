import { AreaInfo } from '@app/components/AreaInfo.js';
import { DistanceInfo } from '@app/components/DistanceInfo.js';
import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ChangesetDetails } from '@features/changesets/components/ChangesetDetails.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { CreditsText } from '@features/credits/components/CreditsText.js';
import { ElevationInfo } from '@features/elevationChart/components/ElevationInfo.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { TrackViewerDetails } from '@features/trackViewer/components/TrackViewerDetails.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import shared from './it-shared.js';
import { addError, Messages } from './messagesInterface.js';

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
  changesets: {
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  },
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
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),

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
    noCookies: () => (
      <>
        Questa funzionalità richiede{' '}
        <CookiesConsentText>l'accettazione dei cookies</CookiesConsentText>.
      </>
    ),
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
    confirmation: 'Conferma',
    success: 'Fatto!',
    privacyPolicy: 'Informativa sulla privacy',
    newOptionText: 'Aggiungi %value%',
    deleteButtonText: 'Rimuovi %value% dalla lista',
    accept: 'Accetta',
  },

  generic: {
    color: 'Colore',
    size: 'Dimensione',
    weight: 'Spessore',
    width: 'Larghezza',
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
    trackViewer: 'Importazione file',
    changesets: 'Modifiche mappa',
    mapDetails: 'Dettagli mappa',
    tracking: 'Tracciamento in tempo reale',
    myMaps: 'Le mie mappe',
  },

  mainMenu: {
    title: 'Menu principale',
    logOut: 'Esci',
    logIn: 'Accedi',
    account: 'Account',
    mapFeaturesExport: 'Esportazione dei dati della mappa',
    gpsDevicesMapExports: 'Mappe per dispositivi GPS',
    embedMap: 'Incorpora la mappa',
    offlineMapExport: 'Esportazione delle mappe offline',
    supportUs: 'Supporta Freemap',
    help: 'Info e aiuto',
    back: 'Indietro',
    mapLegend: 'Legenda',
    contacts: 'Contatti',
    facebook: 'Freemap su Facebook',
    twitter: 'Freemap su Twitter',
    youtube: 'Freemap su YouTube',
    github: 'Freemap su GitHub',
    mastodon: 'Freemap su Mastodon',
    googlePlay: 'Freemap su Google Play',
    appStore: 'Freemap su App Store',
    automaticLanguage: 'Automatico',
    mapToDocumentExport: 'Esportazione della mappa in immagine/documento',
    osmWiki: 'Documentazione su OpenStreetMap',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/Main_Page',
    status: 'Stato dei servizi',
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
        prompt="Alcune funzionalità richiedono i cookies."
        local="Cookies su impostazioni locali e accesso tramite social networks"
        analytics="Cookies analitici"
      />
    ),
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji>&ensp;Siamo con l'Ucraina.{' '}
          <AlertLink href="https://u24.gov.ua/" target="_blank" rel="noopener">
            Sostieni l’Ucraina ›
          </AlertLink>
          &ensp;
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
  },

  ad: {
    self: (email) => (
      <>
        Vuoi pubblicare il tuo annuncio qui? Non esitare a contattarci a {email}
        .
      </>
    ),
    rovas: () => (
      <RovasAd rovasDesc="economic program for volunteers">
        <b>Freemap is created by volunteers.</b>{' '}
        <span className="text-danger">Reward them for their work</span>, with
        your own volunteer work or with money.
      </RovasAd>
    ),
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
    info: () => <TrackViewerDetails />,
  },

  drawing: {
    modify: 'Proprietà',
    edit: {
      title: 'Proprietà',
      color: 'Colore',
      fillColor: 'Colore di riempimento',
      label: 'Etichetta',
      width: 'Larghezza',
      hint: "Per rimuovere l'etichetta lascia il campo vuoto.",
      shape: 'Forma',
      icon: 'Icona',
      iconChoose: 'Scegli icona…',
      iconNone: 'Nessuna icona',
      iconSearch: 'Cerca icone',
      text: 'Testo',
      textHint: 'Icona o massimo 2 caratteri mostrati nel marcatore.',
      type: 'Tipo di geometria',
      dashArray: 'Stile tratteggio',
      lineCap: 'Terminazione linea',
      lineCapRound: 'Arrotondata',
      lineCapButt: 'Piatta',
      lineCapSquare: 'Quadrata',
      lineJoin: 'Giunzione linea',
      lineJoinRound: 'Arrotondata',
      lineJoinMiter: 'A punta',
      lineJoinBevel: 'Smussata',
    },
    continue: 'Continua',
    join: 'Unisci',
    split: 'Separa',
    stopDrawing: 'Ferma il disegno',
    selectPointToJoin: 'Seleziona un punto per unire le linee',
    reverse: 'Inverti direzione',
    simplify: 'Semplifica',
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
    awaitingBankPayment:
      'Siamo in attesa della conferma del bonifico bancario. Il premium si attiverà dopo la ricezione del pagamento.',
    bankPaymentFailed:
      'Alcuni bonifici bancari sono stati rifiutati o sono scaduti. Se pensi che sia un errore, contatta il supporto.',
    bankIntentStatus: {
      pending_settlement:
        'Il bonifico bancario è stato creato ed è in attesa di regolamento.',
      manual_review:
        'Il bonifico bancario richiede una revisione manuale (ad es. importo non corrispondente).',
      paid: 'Il bonifico bancario è stato confermato come pagato.',
      expired: 'Il bonifico bancario è scaduto prima della conferma.',
      failed: 'Il bonifico bancario è fallito.',
      rejected: 'Il bonifico bancario è stato rifiutato.',
      created: "L'intento di pagamento è stato creato e non è ancora regolato.",
      unknown: 'Stato bonifico segnalato dal provider: {}.',
    },
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
      picture: 'Foto del profilo',
      choosePicture: 'Scegli foto',
      pictureTooLarge: 'La foto è troppo grande. La dimensione massima è 5 MB.',
      description: 'Su di me',
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

  mapDetails: {
    notFound: 'Niente trovato qui.',
    fetchingError: ({ err }) =>
      addError(messages, 'Errore durante il recupero dei dettagli', err),
    detail: ({ result }) => (
      <ObjectDetails
        result={result}
        openText="Apri su OpenStreetMap.org"
        historyText="storia"
        editInJosmText="Modifica su JOSM"
      />
    ),
    sources: 'Fonti',
    source: 'Fonte',
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
    url: 'Condividi posizione',
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
    sources: {
      'nominatim-reverse': 'Geocodifica inversa',
      'overpass-nearby': 'Oggetti vicini',
      'overpass-surrounding': 'Oggetti contenenti',
      bbox: 'Riquadro di delimitazione',
      geojson: 'GeoJSON',
      tile: 'Tile',
      coords: 'Coordinate',
      'nominatim-forward': 'Geocodifica',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  documents: {
    errorLoading: 'Errore caricamento documento.',
  },

  auth: {
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
    filterMaps: 'Filtra mappe',
    noMapsFound: 'Nessuna mappa trovata',
    settings: 'Impostazioni livelli mappa',
    layers: 'Livelli mappa',
    switch: 'Livelli mappa',
    photoFilterWarning: 'Il filtro foto è attivo',
    interactiveLayerWarning: 'Il livello dati è nascosto',
    minZoomWarning: (minZoom) => `Accessible from zoom ${minZoom}`,
    letters: {
      S: 'Aereo',
      Z: 'Aereo',
      J1: 'Aereo (2017-2019)',
      J2: 'Aereo (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Trasporti pubblici (ÖPNV)',
      X: outdoorMap,
      i: 'Livello dati',
      I: 'Foto',
      l1: 'Tracce forestali NLC (2017)',
      l2: 'Tracce forestali NLC',
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
      y: 'Ombreggiatura parametrica',
      M: 'Foto di Wikimedia Commons',
      WDZ: 'Composizione arborea',
      WLT: 'Tipi di foresta',
      WGE: 'Geologica',
      WKA: 'Catasto',
      wka: 'Catasto',
      WHC: 'Idrochimica',
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
    addCustomMap: 'Aggiungi mappa personalizzata',
    customMapsEmptyMessage:
      'Nessuna mappa personalizzata definita. Aggiungine una per visualizzare la tua sorgente mappa.',
    base: 'Livelli di base',
    overlay: 'Livelli sovrapposti',
    url: 'Modello URL',
    minZoom: 'Zoom minimo',
    maxNativeZoom: 'Zoom nativo massimo',
    extraScales: 'Risoluzioni extra',
    scaleWithDpi: 'Scala con DPI',
    zIndex: 'Z-Index',
    preferences: 'Preferenze',
    maxZoom: 'Zoom massimo',
    forcedScale: 'Risoluzione forzata',
    resolutionScale: 'Scala di risoluzione',
    resolutionScaleAuto: 'Automatica (predefinita del dispositivo)',
    resolutionScaleHelp:
      'Simula la densità di pixel del display. Influisce su quale variante di tile viene caricata. Se un livello non offre la variante richiesta, viene utilizzata la più alta disponibile.',
    featureScale: 'Dimensione degli elementi',
    featureScaleHelp:
      'Ingrandisce etichette e linee renderizzate. Non ha effetto sui livelli satellitari, di ombreggiatura, WMS o vettoriali (MapLibre).',
    stravaHeatmapColor: 'Colore della heatmap Strava',
    stravaHeatmapColors: {
      hot: 'Caldo',
      blue: 'Blu',
      purple: 'Viola',
      gray: 'Grigio',
      bluered: 'Blu-rosso',
    },
    layer: {
      layer: 'Livello',
      base: 'Base',
      overlay: 'Sovrapposto',
    },
    showMore: 'Mostra più mappe',
    countryWarning: (countries) =>
      `Copre solo i seguenti paesi: ${countries.join(', ')}`,
    configureLayers: 'Configura livelli mappa',
    technologies: {
      tile: 'Riquadri immagine (TMS, XYZ)',
      maplibre: 'Vettore (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Ombreggiatura parametrica',
    },
    technology: 'Tipo',
    loadWmsLayers: 'Carica livelli',
    offlineMaps: 'Mappe offline',
    legacy: 'legacy',
    legacyMapWarning: ({ from, to }) => (
      <>
        La mappa visualizzata <b>{messages.mapLayers.letters[from]}</b> è
        legacy. Passare alla moderna <b>{messages.mapLayers.letters[to]}</b>?
      </>
    ),
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

  premium: {
    title: 'Ottieni accesso premium',
    commonHeader: (
      <>
        <p>
          <strong>Sostieni i volontari che creano questa mappa!</strong>
        </p>
        <p>
          Con <b>8 ore</b> di{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            lavoro volontario
          </a>{' '}
          oppure <b>8 €</b> otterrai un anno di accesso con:
        </p>
        <ul>
          <li>rimozione del banner pubblicitario</li>
          <li
            className="text-decoration-underline"
            title="Strava Heatmap, ombreggiatura dettagliata ad alta risoluzione di Slovacchia e Cechia, livelli di zoom più alti della mappa Outdoor, livelli di zoom più alti delle mappe ortofoto di Slovacchia e Cechia, varie mappe basate su WMS"
          >
            livelli mappa premium
          </li>
          <li>foto premium</li>
          <li>routing multimodale</li>
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
    premiumUser: 'Utente con accesso premium',
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
    youHaveCredits: (amount, explainCredits) => (
      <>
        Hai {amount}{' '}
        {explainCredits ? (
          <CreditsText
            credits="crediti"
            help="Puoi usare i crediti per [l'esportazione delle mappe offline]."
          />
        ) : (
          'crediti'
        )}
        .
      </>
    ),
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
};

export default messages;
