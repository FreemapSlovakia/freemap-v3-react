import { MaptilerAttribution } from '@app/components/MaptilerAttribution.js';
import { CookiesConsentText } from '@features/auth/components/CookiesConsentText.js';
import { CookieConsent } from '@features/cookieConsent/components/CookieConsent.js';
import { Attribution } from '@shared/components/Attribution.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import shared from './de-shared.js';
import { addError, type Messages } from './messagesInterface.js';

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
    collapse: 'Einklappen',
    expand: 'Ausklappen',
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
    resetToDefaults: 'Auf Standard zurücksetzen',
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
    copyToDrawing: 'In die Zeichnung kopieren',
    copyTo: ({ tool }) => <>Nach {tool} kopieren</>,
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
    drawingTool: 'Zeichenwerkzeug',
    copyOk: 'In Zwischenablage kopiert.',
    noCookies: () => (
      <>
        Diese Funktion erfordert die{' '}
        <CookiesConsentText>Zustimmung zu Cookies</CookiesConsentText>.
      </>
    ),
    name: 'Name',
    icon: 'Symbol',
    iconChoose: 'Symbol auswählen…',
    iconNone: 'Kein Symbol',
    iconSearch: 'Symbole suchen',
    load: 'Laden',
    unknown: 'Unbekannt',
    enablePopup:
      'Bitte aktivieren Sie Pop-up-Fenster für diese Seite in Ihrem Browser.',
    broadcastChannelUnsupported:
      'Diese Aktion wird von Ihrem Browser nicht unterstützt (BroadcastChannel ist nicht verfügbar, z. B. im privaten Modus oder in einem In-App-Browser). Bitte verwenden Sie ein normales Fenster in einem modernen Browser.',
    componentLoadingError:
      'Fehler beim Laden der Komponente. Bitte überprüfen Sie Ihre Internetverbindung.',
    offline: 'Sie sind nicht mit dem Internet verbunden.',
    offlineUnavailable: 'Ohne Internetverbindung nicht verfügbar.',
    offlineToolUnavailable:
      'Dieses Werkzeug kann ohne Internetverbindung nichts laden.',
    offlineNotice:
      'Sie sind nicht mit dem Internet verbunden, daher kann hier nichts geladen oder gesendet werden.',
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
    termsOfService: 'Nutzungsbedingungen',
    refundPolicy: 'Rückerstattungsrichtlinie',
    infoAndLegal: 'Karteninformationen und Rechtliches',
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
    drawPolygonHole: 'Loch im Polygon',
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
    dataViewer: 'Tracks und Daten',
    changesets: 'Kartenänderungen',
    mapDetails: 'Kartendetails',
    tracking: 'Live-Tracking',
    myMaps: 'Meine Karten',
    myMap: 'Meine Karte',
    gpsRecorder: 'GPS-Recorder',
    toposcope: 'Panoramatafel',
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
    language: 'Sprache',
  },

  main: {
    infoBars: {},
    title: shared.title,
    description: shared.description,
    clearMap: 'Kartenelemente löschen',
    close: 'Schließen',
    closeTool: 'Werkzeug schließen',
    locateMe: 'Standort ermitteln',
    locationError: 'Fehler beim Abrufen des Standorts.',
    locationNoSignal: 'Noch kein GPS-Signal.',
    headingSource: 'Richtungsanzeige',
    headingSources: {
      none: 'Ausgeblendet',
      gps: 'Bewegungsrichtung',
      compass: 'Gerätekompass',
    },
    headingSourceHelp:
      'Die Bewegungsrichtung stammt vom GPS und erscheint nur in Bewegung. Der Gerätekompass funktioniert auch im Stand, benötigt aber eine Berechtigung und kann ungenau sein.',
    bearingLine: 'Entfernung und Peilung',
    bearingLineHelp:
      'Zeichnet während der Ortung eine Linie zwischen Ihrer Position und einem Fadenkreuz in der Kartenmitte, beschriftet mit der Entfernung und der Peilung von Ihrer Position zum Fadenkreuz. Erscheint, sobald Sie die Karte von Ihrer Position wegschieben.',
    compassPermissionDenied: 'Zugriff auf den Kompass wurde verweigert.',
    compassUnavailable:
      'Keine Kompassdaten. Ihr Gerät hat möglicherweise keinen Kompass, oder der Zugriff darauf ist blockiert.',
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

  search: {
    offlineHint:
      'Ohne Internetverbindung können nur Koordinaten, ein Begrenzungsrahmen, Kachelnummern (z/x/y) oder eingefügtes GeoJSON gefunden werden.',
    inProgress: 'Suche…',
    noResults: 'Keine Ergebnisse gefunden',
    prompt: 'Ort eingeben',
    routeFrom: 'Route von hier',
    routeTo: 'Route hierher',
    fetchingError: ({ err }) => addError(messages, 'Fehler bei der Suche', err),
    buttonTitle: 'Suchen',
    placeholder: 'In der Karte suchen',
    result: 'Fund',
    keepOnMap: 'Auf der Karte behalten',
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
    lookupStyle: 'Stil des Fundes',
    resetApp: 'Anwendung zurücksetzen',
    resetAppConfirm:
      'Alle Anwendungseinstellungen auf die Standardwerte zurücksetzen und die Seite neu laden? Sie werden abgemeldet.',
    letters: {
      S: 'Luftbild',
      Z: 'Luftbild',
      J1: 'Luftbild (2017-2019)',
      J2: 'Luftbild (2020-2022)',
      O: 'OpenStreetMap',
      d: 'Öffentlicher Verkehr (ÖPNV)',
      X: outdoorMap,
      XK: 'KST-Wanderwege',
      i: 'Datenschicht',
      I: 'Fotos',
      l1: 'Forststraßen NLC (2017)',
      l2: 'Forststraßen NLC',
      w: 'Wikipedia',
      R: 'Wetterradar',
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
      routing: 'Routing',
    },

    attr: {
      osmData: '© OpenStreetMap-Mitwirkende',
      maptiler: (
        <MaptilerAttribution
          tilesFrom="Vektorkacheln von"
          hostedBy="gehostet von"
        />
      ),
      photosCc: 'verschiedene Creative-Commons-Lizenzen',
    },

    showAll: 'Alle Karten anzeigen',
    filterMaps: 'Karten filtern',
    noMapsFound: 'Keine Karten gefunden',
    settings: 'Karten verwalten',
    layers: 'Karten',
    switch: 'Karten',
    photoFilterWarning: 'Fotofilter ist aktiv',
    interactiveLayerWarning: 'Datenschicht ist ausgeblendet',
    minZoomWarning: (minZoom) => `Verfügbar ab Zoomstufe ${minZoom}`,
    outsideViewWarning:
      'Der aktuelle Kartenausschnitt liegt außerhalb dieser Karte',
    offlineWarning: 'Diese Karte ist nicht für die Offline-Nutzung gespeichert',
    customBase: 'Benutzerdefinierte Karte',
    customMaps: 'Benutzerdefinierte Karten',
    addCustomMap: 'Benutzerdefinierte Karte hinzufügen',
    activate: 'Aktivieren',
    customMapsEmptyMessage:
      'Noch keine benutzerdefinierten Karten definiert. Fügen Sie eine hinzu, um Ihre eigene Kartenquelle anzuzeigen.',
    base: 'Grundlegende Ebenen',
    overlay: 'Überlagerungsebenen',
    url: 'URL-Vorlage',
    minZoom: 'Min. Zoomstufe',
    maxNativeZoom: 'Max. native Zoomstufe',
    extraScales: 'Zusätzliche Auflösungen',
    scaleWithDpi: 'Mit DPI skalieren',
    tiled: 'In Kacheln laden',
    tiledHelp:
      'Ein WMS wird standardmäßig als ein einziges Bild des gesamten Ausschnitts angefordert: eine Anfrage statt Dutzender, und Beschriftungen werden nicht an Kachelrändern abgeschnitten. Kacheln lohnen sich für einen Server, der die Bildgröße begrenzt oder Kacheln zwischenspeichert — um den Preis vieler Anfragen pro Ansicht.',
    zIndex: 'Z-Index',
    preferences: 'Einstellungen',
    mapSection: 'Karte',
    maxZoom: 'Maximale Zoomstufe',
    zoomSnap: 'Zoomschritt',
    zoomSnapFree: 'Stufenlos',
    zoomSnapHelp:
      'Die kleinste Zoomänderung, auf der Mausrad-, Pinch- und Rahmenzoom stehen bleiben können. 1 hält die Karte auf ganzen Zoomstufen, ein Bruchteil lässt sie auch dazwischen halten, und Stufenlos überall. Die Tasten und Schaltflächen + und – gehen immer zur nächsten ganzen Stufe.',
    forcedScale: 'Erzwungene Auflösung',
    resolutionScale: 'Auflösungsskala',
    resolutionScaleAuto: 'Automatisch (Gerätestandard)',
    resolutionScaleHelp:
      'Simuliert die Pixeldichte des Displays. Beeinflusst, welche Kachelvariante geladen wird. Wenn eine Ebene die angeforderte Variante nicht anbietet, wird stattdessen die höchste verfügbare verwendet.',
    featureScale: 'Objektgröße',
    featureScaleHelp:
      'Vergrößert gerenderte Beschriftungen und Linien. Hat keine Auswirkung auf Satelliten-, Schattierungs-, WMS- oder Vektor-Ebenen (MapLibre).',
    layer: {
      layer: 'Ebene',
      base: 'Basis',
      overlay: 'Overlay',
    },
    showMore: 'Mehr Karten anzeigen',
    configureLayers: 'Ebenen konfigurieren',
    technologies: {
      tile: 'Bildkacheln (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametrische Schattierung',
    },
    technology: 'Typ',
    loadWmsLayers: 'Layer laden',
    serverNotResponding: ({ name }) => (
      <>
        Der Server der Karte <b>{name}</b> antwortet nicht.
      </>
    ),
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
    settings: 'Höhe',
    settingsHelp:
      'Die ersten beiden Einstellungen korrigieren ein Geländemodell und gelten daher überall dort, wo die Höhe daraus gelesen wird: bei geplanten Routen, gezeichneten Linien und Messungen sowie bei importierten Tracks, deren Höhe Sie vom Server ersetzt haben. Aufgezeichnete Höhen — Live-Tracking oder ein Track, den Sie wie aufgezeichnet belassen haben — bleiben unangetastet. Exportierte Dateien behalten immer ihre eigene Höhe.',
    windowOff: 'aus',
    windowWholeLine: 'ganze Linie',
    despike: 'Spitzen entfernen',
    despikeHelp:
      'Wenn ein Weg einige Meter neben der Straße gezeichnet ist, die er beschreibt, liefert das Geländemodell die Böschung oder Felswand daneben. Spitzen, die schmaler als die Hälfte dieses Werts sind, werden entfernt und das Profil leicht geglättet; breitere bleiben erhalten, da sie echtes Gelände sind. Null schaltet die Funktion ab.',
    ditchFill: 'Gräben des Geländemodells auffüllen',
    ditchFillHelp:
      'Die detaillierten nationalen Geländemodelle, die in einigen Ländern verfügbar sind, sind meist hydrologisch angepasst: An jedem Durchlass graben sie einen Graben durch die Straße. Senken, die schmaler als dieser Wert sind, werden aufgefüllt; breitere bleiben erhalten, da sie echtes Gelände sind. Null schaltet die Funktion ab und ändert nichts, wo das globale Modell verwendet wird.',
    gradeWindow: 'Fenster für die Steigung',
    gradeWindowHelp:
      'Wenn Sie auf das Höhenprofil zeigen, wird die Stelle auf der Karte markiert und ihre Steigung angezeigt. Die Steigung wird über einen Abschnitt dieser Länge um den Punkt gemittelt, damit ein paar Meter GPS-Rauschen nicht wie eine Wand wirken. Null misst sie zwischen benachbarten Punkten des Profils.',
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
