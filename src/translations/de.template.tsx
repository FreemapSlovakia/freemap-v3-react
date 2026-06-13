import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { Attribution } from '@shared/components/Attribution.js';
import { Emoji } from '@shared/components/Emoji.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AlertLink } from 'react-bootstrap';
import { CookiesConsentText } from '@/features/auth/components/CookiesConsentText.js';
import shared from './de-shared.js';
import { addError, Messages } from './messagesInterface.js';

const masl = 'm\xa0ü.\xa0M.';

const getErrorMarkup = (ticketId?: string) => `<h1>Anwendungsfehler</h1>
<p>
  ${
    ticketId
      ? `Der Fehler wurde uns automatisch unter der ID <b>${ticketId}</b> gemeldet.`
      : ''
  }
  Du kannst den Fehler ${
    ticketId ? 'auch ' : ''
  }auf <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">GitHub</a> melden
  oder uns Details per E-Mail an <a href="mailto:freemap@freemap.sk?subject=Fehlermeldung%20auf%20www.freemap.sk">freemap@freemap.sk</a> senden.
</p>
<p>
  Vielen Dank.
</p>`;

const outdoorMap = 'Wandern, Radfahren, Langlauf, Reiten';

const messages: DeepPartialWithRequiredObjects<Messages> = {
  general: {
    iso: 'de_DE',
    elevationProfile: 'Höhenprofil',
    save: 'Speichern',
    cancel: 'Abbrechen',
    modify: 'Bearbeiten',
    delete: 'Löschen',
    remove: 'Entfernen',
    close: 'Schließen',
    apply: 'Anwenden',
    exitFullscreen: 'Vollbildmodus beenden',
    fullscreen: 'Vollbild',
    yes: 'Ja',
    no: 'Nein',
    masl,
    copyCode: 'Code kopieren',
    loading: 'Lade…',
    ok: 'OK',
    preventShowingAgain: 'Nicht erneut anzeigen',
    closeWithoutSaving: 'Fenster mit ungespeicherten Änderungen schließen?',
    back: 'Zurück',
    internalError: ({ ticketId }) => (
      <span dangerouslySetInnerHTML={{ __html: getErrorMarkup(ticketId) }} />
    ),
    processorError: ({ err }) => addError(messages, 'Anwendungsfehler', err),
    seconds: 'Sekunden',
    minutes: 'Minuten',
    meters: 'Meter',
    createdAt: 'Erstellt am',
    modifiedAt: 'Geändert am',
    actions: 'Aktionen',
    add: 'Neu hinzufügen',
    clear: 'Löschen',
    convertToDrawing: 'In Zeichnung umwandeln',
    simplifyPrompt:
      'Bitte den Vereinfachungsfaktor eingeben. Null für keine Vereinfachung eingeben.',
    copyUrl: 'URL kopieren',
    copyPageUrl: 'Seiten-URL kopieren',
    savingError: ({ err }) => addError(messages, 'Fehler beim Speichern', err),
    loadError: ({ err }) => addError(messages, 'Fehler beim Laden', err),
    deleteError: ({ err }) => addError(messages, 'Fehler beim Löschen', err),
    operationError: ({ err }) =>
      addError(messages, 'Fehler bei der Ausführung', err),
    deleted: 'Gelöscht.',
    saved: 'Gespeichert.',
    visual: 'Anzeige',
    copyOk: 'In Zwischenablage kopiert.',
    noCookies: () => (
      <>
        Diese Funktion erfordert die{' '}
        <CookiesConsentText>Zustimmung zu Cookies</CookiesConsentText>.
      </>
    ),
    name: 'Name',
    load: 'Laden',
    unnamed: 'Kein Name',
    enablePopup:
      'Bitte aktivieren Sie Pop-up-Fenster für diese Seite in Ihrem Browser.',
    componentLoadingError:
      'Fehler beim Laden der Komponente. Bitte überprüfen Sie Ihre Internetverbindung.',
    offline: 'Sie sind nicht mit dem Internet verbunden.',
    connectionError: 'Fehler beim Verbinden mit dem Server.',
    experimentalFunction: 'Experimentelle Funktion',
    attribution: () => (
      <Attribution unknown="Kartenlizenz ist nicht angegeben" />
    ),
    unauthenticatedError:
      'Bitte melden Sie sich an, um auf diese Funktion zuzugreifen.',
    confirmation: 'Bestätigung',
    export: 'Exportieren',
    success: 'Fertig!',
    expiration: 'Ablaufdatum',
    privacyPolicy: 'Datenschutzrichtlinie',
    newOptionText: '%value% hinzufügen',
    deleteButtonText: '%value% aus der Liste entfernen',
    accept: 'Akzeptieren',
  },

  generic: {
    color: 'Farbe',
    size: 'Größe',
    weight: 'Stärke',
    width: 'Breite',
  },

  theme: {
    light: 'Heller Modus',
    dark: 'Dunkler Modus',
    auto: 'Automatischer Modus',
  },

  selections: {
    objects: 'Objekt (POI)',
    drawPoints: 'Punkt',
    drawLines: 'Linie',
    drawPolygons: 'Polygon',
    tracking: 'Verfolgung',
    linePoint: 'Linienpunkt',
    polygonPoint: 'Polygonpunkt',
  },

  tools: {
    none: 'Werkzeug schließen',
    routePlanner: 'Routenplaner',
    objects: 'Objekte (POIs)',
    photos: 'Fotos',
    measurement: 'Zeichnen und Messen',
    drawPoints: 'Punkte zeichnen',
    drawLines: 'Linien zeichnen',
    drawPolygons: 'Polygone zeichnen',
    trackViewer: 'Dateiimport',
    changesets: 'Kartenänderungen',
    mapDetails: 'Kartendetails',
    tracking: 'Live-Tracking',
    myMaps: 'Meine Karten',
  },

  mainMenu: {
    title: 'Hauptmenü',
    logOut: 'Abmelden',
    logIn: 'Anmelden',
    account: 'Konto',
    mapFeaturesExport: 'Export der Kartendaten',
    gpsDevicesMapExports: 'Karten für GPS-Geräte',
    embedMap: 'Karte einbetten',
    offlineMapExport: 'Export von Offline-Karten',
    supportUs: 'Freemap unterstützen',
    help: ' Info & Hilfe',
    back: 'Zurück',
    mapLegend: 'Kartenlegende',
    contacts: 'Kontakt',
    facebook: 'Freemap auf Facebook',
    twitter: 'Freemap auf Twitter',
    youtube: 'Freemap auf YouTube',
    github: 'Freemap auf GitHub',
    mastodon: 'Freemap auf Mastodon',
    googlePlay: 'Freemap auf Google Play',
    appStore: 'Freemap im App Store',
    automaticLanguage: 'Automatisch',
    mapToDocumentExport: 'Export der Karte als Bild/Dokument',
    osmWiki: 'OpenStreetMap-Dokumentation',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/De:Main_Page',
    status: 'Dienststatus',
  },

  main: {
    infoBars: {
      ua: () => (
        <>
          <Emoji>🇺🇦</Emoji>&ensp;Wir stehen an der Seite der Ukraine.{' '}
          <AlertLink href="https://u24.gov.ua/" target="_blank" rel="noopener">
            Ukraine unterstützen ›
          </AlertLink>
          &ensp;
          <Emoji>🇺🇦</Emoji>
        </>
      ),
    },
    title: shared.title,
    description: shared.description,
    clearMap: 'Kartenelemente löschen',
    close: 'Schließen',
    closeTool: 'Werkzeug schließen',
    locateMe: 'Standort ermitteln',
    locationError: 'Fehler beim Abrufen des Standorts.',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    devInfo: () => (
      <div>
        Dies ist eine Testversion von Freemap Slovakia. Für die
        Produktionsversion besuchen Sie bitte{' '}
        <a href="https://www.freemap.sk/">www.freemap.sk</a>.
      </div>
    ),
    copyright: 'Urheberrecht',
    cookieConsent: () => (
      <CookieConsent
        prompt="Einige Funktionen erfordern Cookies."
        local="Cookies für lokale Einstellungen und Anmeldung über soziale Netzwerke"
        analytics="Analytische Cookies"
      />
    ),
  },

  mapDetails: {
    notFound: 'Nichts hier gefunden.',

    fetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Details', err),

    detail: ({ result }) => (
      <ObjectDetails
        result={result}
        openText="Öffnen auf OpenStreetMap.org"
        historyText="Verlauf"
        editInJosmText="Bearbeiten in JOSM"
      />
    ),

    sources: 'Quellen',
    source: 'Quelle',
  },

  search: {
    inProgress: 'Suche…',
    noResults: 'Keine Ergebnisse gefunden',
    prompt: 'Ort eingeben',
    routeFrom: 'Route von hier',
    routeTo: 'Route hierher',
    fetchingError: ({ err }) => addError(messages, 'Fehler bei der Suche', err),
    buttonTitle: 'Suchen',
    placeholder: 'In der Karte suchen',
    result: 'Fund',
    sources: {
      'nominatim-reverse': 'Reverse-Geokodierung',
      'overpass-nearby': 'Nahegelegene Objekte',
      'overpass-surrounding': 'Enthaltende Objekte',
      bbox: 'Begrenzungsrahmen',
      geojson: 'GeoJSON',
      tile: 'Kachel',
      coords: 'Koordinaten',
      'nominatim-forward': 'Geokodierung',
      osm: 'OpenStreetMap',
      'wms:': 'WMS',
    },
  },

  mapLayers: {
    letters: {
      S: 'Luftbild',
      Z: 'Luftbild',
      J1: 'Luftbild (2017-2019)',
      J2: 'Luftbild (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Öffentlicher Verkehr (ÖPNV)',
      X: outdoorMap,
      i: 'Datenschicht',
      I: 'Fotos',
      l1: 'Forststraßen NLC (2017)',
      l2: 'Forststraßen NLC',
      s0: 'Strava (alle)',
      s1: 'Strava (Fahrten)',
      s2: 'Strava (Läufe)',
      s3: 'Strava (Wasseraktivitäten)',
      s4: 'Strava (Winteraktivitäten)',
      w: 'Wikipedia',
      '5': 'Geländeschattierung',
      '6': 'Oberflächenschattierung',
      '7': 'Detaillierte Geländeschattierung',
      '8': 'Detaillierte Geländeschattierung',
      VO: 'OpenStreetMap Vektor',
      VS: 'Straßen Vektor',
      VD: 'Dataviz Vektor',
      VT: 'Outdoor Vektor',
      h: 'Parametrische Schattierung',
      z: 'Parametrische Schattierung',
      y: 'Parametrische Schattierung',
      M: 'Wikimedia Commons Fotos',
      WDZ: 'Baumartenzusammensetzung',
      WLT: 'Waldtypen',
      WGE: 'Geologisch',
      WKA: 'Kataster',
      wka: 'Kataster',
      WHC: 'Hydrochemisch',
    },

    type: {
      map: 'Karte',
      data: 'Daten',
      photos: 'Bilder',
    },

    attr: {
      osmData: '© OpenStreetMap-Mitwirkende',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorkacheln von"
          hostedBy="gehostet von"
        />
      ),
    },

    showAll: 'Alle Karten anzeigen',
    filterMaps: 'Karten filtern',
    noMapsFound: 'Keine Karten gefunden',
    settings: 'Karteneinstellungen',
    layers: 'Karten',
    switch: 'Karten',
    photoFilterWarning: 'Fotofilter ist aktiv',
    interactiveLayerWarning: 'Datenschicht ist ausgeblendet',
    minZoomWarning: (minZoom) => `Verfügbar ab Zoomstufe ${minZoom}`,
    customBase: 'Benutzerdefinierte Karte',
    customMaps: 'Benutzerdefinierte Karten',
    addCustomMap: 'Benutzerdefinierte Karte hinzufügen',
    customMapsEmptyMessage:
      'Noch keine benutzerdefinierten Karten definiert. Fügen Sie eine hinzu, um Ihre eigene Kartenquelle anzuzeigen.',
    base: 'Grundlegende Ebenen',
    overlay: 'Überlagerungsebenen',
    url: 'URL-Vorlage',
    minZoom: 'Min. Zoomstufe',
    maxNativeZoom: 'Max. native Zoomstufe',
    extraScales: 'Zusätzliche Auflösungen',
    scaleWithDpi: 'Mit DPI skalieren',
    zIndex: 'Z-Index',
    preferences: 'Einstellungen',
    maxZoom: 'Maximale Zoomstufe',
    forcedScale: 'Erzwungene Auflösung',
    resolutionScale: 'Auflösungsskala',
    resolutionScaleAuto: 'Automatisch (Gerätestandard)',
    resolutionScaleHelp:
      'Simuliert die Pixeldichte des Displays. Beeinflusst, welche Kachelvariante geladen wird. Wenn eine Ebene die angeforderte Variante nicht anbietet, wird stattdessen die höchste verfügbare verwendet.',
    featureScale: 'Objektgröße',
    featureScaleHelp:
      'Vergrößert gerenderte Beschriftungen und Linien. Hat keine Auswirkung auf Satelliten-, Schattierungs-, WMS- oder Vektor-Ebenen (MapLibre).',
    stravaHeatmapColor: 'Farbe der Strava-Heatmap',
    stravaHeatmapColors: {
      hot: 'Heiß',
      blue: 'Blau',
      purple: 'Violett',
      gray: 'Grau',
      bluered: 'Blau-rot',
    },
    layer: {
      layer: 'Ebene',
      base: 'Basis',
      overlay: 'Overlay',
    },
    showMore: 'Mehr Karten anzeigen',
    countryWarning: (countries) =>
      `Deckt nur folgende Länder ab: ${countries.join(', ')}`,
    configureLayers: 'Kartenebenen konfigurieren',
    technologies: {
      tile: 'Bildkacheln (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametrische Schattierung',
    },
    technology: 'Typ',
    loadWmsLayers: 'Layer laden',
    offlineMaps: 'Offline-Karten',
    legacy: 'veraltet',
    legacyMapWarning: ({ from, to }) => (
      <>
        Die angezeigte Karte <b>{messages.mapLayers.letters[from]}</b> ist
        veraltet. Zur modernen <b>{messages.mapLayers.letters[to]}</b>wechseln?
      </>
    ),
  },

  elevationChart: {
    distance: 'Entfernung [km]',
    ele: `Höhe [${masl}]`,
    fetchError: ({ err }) =>
      addError(messages, 'Fehler beim Abrufen des Höhenprofils', err),
  },

  errorCatcher: {
    html: (ticketId) => `${getErrorMarkup(ticketId)}
    <p>
      Sie können Folgendes versuchen:
    </p>
    <ul>
      <li><a href="">Letzte Seite neu laden</a></li>
      <li><a href="/">Startseite laden</a></li>
      <li><a href="/#reset-local-storage">Lokale Daten löschen und Startseite laden</a></li>
    </ul>
  `,
  },

  mapCtxMenu: {
    centerMap: 'Karte hier zentrieren',
    measurePosition: 'Koordinaten und Höhe ermitteln',
    addPoint: 'Punkt hier hinzufügen',
    startLine: 'Linie oder Messung hier starten',
    queryFeatures: 'Objekte in der Nähe abfragen',
    startRoute: 'Route von hier planen',
    finishRoute: 'Route bis hier planen',
    showPhotos: 'Fotos in der Nähe anzeigen',
  },
  premium: {
    title: 'Premium-Zugang erhalten',

    commonHeader: (
      <>
        <p>
          <strong>
            Unterstütze die Freiwilligen, die diese Karte erstellen!
          </strong>
        </p>
        <p className="mb-1">
          Für <b>8 Stunden</b>deiner{' '}
          <a
            href="https://rovas.app/freemap-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            freiwilligen Arbeit
          </a>{' '}
          oder <b>8 €</b> erhältst du ein Jahr Zugang mit:
        </p>
        <ul>
          <li>entferntem Werbebanner</li>
          <li
            className="text-decoration-underline"
            title="Hochauflösende detaillierte Schummerung der Slowakei und Tschechiens, höchste Zoomstufen der Outdoor-Karte, höchste Zoomstufen der Orthofotokarten der Slowakei und Tschechiens, verschiedene WMS-basierte Karten"
          >
            Premium-Kartenebenen
          </li>
          <li>Premium-Fotos</li>
          <li>multimodale Routenplanung</li>
        </ul>
      </>
    ),

    stepsForAnonymous: (
      <>
        <div className="fw-bold">Vorgehensweise</div>
        <div className="mb-3">
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Schritt 1</span> – Erstelle ein Konto
            hier bei Freemap (unten)
          </p>
          <p className="mb-1 ms-3">
            <span className="fw-semibold">Schritt 2</span> – In der App Rováš,
            zu der wir dich nach der Registrierung weiterleiten, sende uns die
            Zahlung.
          </p>
        </div>
      </>
    ),
    continue: 'Weiter',
    success: 'Glückwunsch, du hast Premium-Zugang erhalten!',
    becomePremium: 'Premium-Zugang erhalten',
    youArePremium: (date) => (
      <>
        Du hast Premium-Zugang bis <b>{date}</b>.
      </>
    ),
    premiumOnly: 'Nur mit Premium-Zugang verfügbar.',
    alreadyPremium: 'Du hast bereits Premium-Zugang.',
    premiumUser: 'Nutzer mit Premium-Zugang',
  },
  errorStatus: {
    100: 'Weiter',
    101: 'Protokollwechsel',
    102: 'Verarbeitung',
    103: 'Frühe Hinweise',
    200: 'OK',
    201: 'Erstellt',
    202: 'Akzeptiert',
    203: 'Nicht autorisierte Information',
    204: 'Kein Inhalt',
    205: 'Inhalt zurücksetzen',
    206: 'Teilweiser Inhalt',
    207: 'Multi-Status',
    208: 'Bereits gemeldet',
    226: 'IM verwendet',
    300: 'Mehrere Auswahlmöglichkeiten',
    301: 'Dauerhaft verschoben',
    302: 'Gefunden',
    303: 'Siehe andere',
    304: 'Nicht geändert',
    305: 'Proxy verwenden',
    306: 'Proxy wechseln',
    307: 'Temporäre Weiterleitung',
    308: 'Permanente Weiterleitung',
    400: 'Fehlerhafte Anfrage',
    401: 'Nicht autorisiert',
    402: 'Zahlung erforderlich',
    403: 'Verboten',
    404: 'Nicht gefunden',
    405: 'Methode nicht erlaubt',
    406: 'Nicht akzeptabel',
    407: 'Proxy-Authentifizierung erforderlich',
    408: 'Zeitüberschreitung der Anfrage',
    409: 'Konflikt',
    410: 'Gegangen',
    411: 'Länge erforderlich',
    412: 'Vorbedingung fehlgeschlagen',
    413: 'Zu große Nutzlast',
    414: 'URI zu lang',
    415: 'Medientyp nicht unterstützt',
    416: 'Bereich nicht erfüllbar',
    417: 'Erwartung fehlgeschlagen',
    418: 'Ich bin eine Teekanne',
    421: 'Falsch zugewiesene Anfrage',
    422: 'Nicht verarbeitbare Entität',
    423: 'Gesperrt',
    424: 'Abhängigkeit fehlgeschlagen',
    425: 'Zu früh',
    426: 'Upgrade erforderlich',
    428: 'Vorbedingung erforderlich',
    429: 'Zu viele Anfragen',
    431: 'Anforderungsheader zu groß',
    451: 'Aus rechtlichen Gründen nicht verfügbar',
    500: 'Interner Serverfehler',
    501: 'Nicht implementiert',
    502: 'Fehlerhaftes Gateway',
    503: 'Dienst nicht verfügbar',
    504: 'Gateway-Zeitüberschreitung',
    505: 'HTTP-Version nicht unterstützt',
    506: 'Variante verhandelt ebenfalls',
    507: 'Ungenügender Speicherplatz',
    508: 'Schleife entdeckt',
    510: 'Nicht erweitert',
    511: 'Netzwerkauthentifizierung erforderlich',
  },
  gpu: {
    lost: 'Das GPU-Gerät ging verloren: ',
    noAdapter: 'WebGPU-Adapter ist in diesem Browser nicht verfügbar.',
    notSupported: 'WebGPU wird in diesem Browser nicht unterstützt.',
    errorRequestingDevice: 'GPU-Gerät konnte nicht erstellt werden: ',
    other: 'Fehler beim Rendern: ',
  },
};

export default messages;
