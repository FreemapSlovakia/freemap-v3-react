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
import { FaKey } from 'react-icons/fa';
import shared from './de-shared.js';
import { addError, Messages } from './messagesInterface.js';

const nf00 = new Intl.NumberFormat('de', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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
    internalError: ({ ticketId }) => `!HTML!${getErrorMarkup(ticketId)}`,
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
    noCookies: 'Diese Funktion erfordert die Zustimmung zu Cookies.',
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
    areYouSure: 'Sind Sie sicher?',
    export: 'Exportieren',
    success: 'Fertig!',
    expiration: 'Ablaufdatum',
    privacyPolicy: 'Datenschutzrichtlinie',
    newOptionText: '%value% hinzufügen',
    deleteButtonText: '%value% aus der Liste entfernen',
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
    trackViewer: 'Trackanzeige (GPX)',
    changesets: 'Kartenänderungen',
    mapDetails: 'Kartendetails',
    tracking: 'Live-Tracking',
    maps: 'Meine Karten',
  },

  routePlanner: {
    ghParams: {
      tripParameters: 'Reiseparameter',
      seed: 'Zufallswert',
      distance: 'Ungefähre Entfernung',
      isochroneParameters: 'Isochrone-Parameter',
      buckets: 'Intervalle',
      timeLimit: 'Zeitlimit',
      distanceLimit: 'Entfernungslimit',
    },
    point: {
      pick: 'Auf der Karte auswählen',
      current: 'Deine Position',
      home: 'Startposition',
      point: 'Routenpunkt',
    },
    transportType: {
      car: 'Auto',
      car4wd: 'Auto (4WD)',
      bike: 'Fahrrad',
      foot: 'Zu Fuß',
      hiking: 'Wandern',
      mtb: 'Mountainbike',
      racingbike: 'Rennrad',
      motorcycle: 'Motorrad',
      manual: 'Luftlinie',
    },
    mode: {
      route: 'In Reihenfolge',
      trip: 'Besuchte Orte',
      roundtrip: 'Besuchte Orte (Rundreise)',
      'routndtrip-gh': 'Rundreise',
      isochrone: 'Isochronen',
    },
    milestones: 'Kilometermarkierungen',
    start: 'Start',
    finish: 'Ziel',
    swap: 'Start und Ziel tauschen',
    development: 'in Entwicklung',
    alternative: 'Alternative',
    distance: ({ value, diff }) => (
      <>
        Entfernung:{' '}
        <b>
          {value}
          {diff ? ` (+ ${diff})` : ''}
        </b>
      </>
    ),
    duration: ({ h, m, diff }) => (
      <>
        Dauer:{' '}
        <b>
          {h}h {m}m{diff && ` (+ ${diff.h}h ${diff.m}m)`}
        </b>
      </>
    ),
    summary: ({ distance, h, m }) => (
      <>
        Entfernung: <b>{distance}</b> | Dauer:{' '}
        <b>
          {h}h {m}m
        </b>
      </>
    ),
    noHomeAlert: {
      msg: 'Du musst zuerst deine Startposition in den Einstellungen setzen.',
      setHome: 'Setzen',
    },
    showMidpointHint:
      'Ziehe ein Routensegment, um einen Zwischenpunkt hinzuzufügen.',
    gpsError: 'Fehler beim Ermitteln deiner aktuellen Position.',
    routeNotFound:
      'Keine Route gefunden. Versuche, die Parameter zu ändern oder die Punkte zu verschieben.',
    fetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Finden der Route', err),
    manualTooltip: 'Folgenden Abschnitt mit einer geraden Linie verbinden',
  },
  mainMenu: {
    title: 'Hauptmenü',
    logOut: 'Abmelden',
    logIn: 'Anmelden',
    account: 'Konto',
    mapFeaturesExport: 'Export der Kartendaten',
    mapExports: 'Karten für GPS-Geräte',
    embedMap: 'Karte einbetten',
    supportUs: 'Freemap unterstützen',
    help: ' Info & Hilfe',
    back: 'Zurück',
    mapLegend: 'Kartenlegende',
    contacts: 'Kontakt',
    facebook: 'Freemap auf Facebook',
    twitter: 'Freemap auf Twitter',
    youtube: 'Freemap auf YouTube',
    github: 'Freemap auf GitHub',
    automaticLanguage: 'Automatisch',
    mapExport: 'Export der Karte als Bild/Dokument',
    osmWiki: 'OpenStreetMap-Dokumentation',
    wikiLink: 'https://wiki.openstreetmap.org/wiki/De:Main_Page',
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
        prompt="Einige Funktionen erfordern Cookies. Akzeptieren:"
        local="Cookies für lokale Einstellungen und Anmeldung über soziale Netzwerke"
        analytics="Analytische Cookies"
      />
    ),
  },

  ad: {
    self: (email) => (
      <>
        Möchten Sie hier Ihre eigene Werbung platzieren? Kontaktieren Sie uns
        gerne unter {email}.
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

  gallery: {
    stats: {},

    f: {
      '-createdAt': 'von zuletzt hochgeladenen',
      '-takenAt': 'von neuesten aufgenommenen',
      '-rating': 'von am höchsten bewerteten',
      '-lastCommentedAt': 'vom letzten Kommentar',
    },

    c: {
      disable: 'Nicht einfärben',
      mine: 'Meine hervorheben',
      userId: 'Autor',
      rating: 'Bewertung',
      takenAt: 'Aufnahmedatum',
      createdAt: 'Hochladedatum',
      season: 'Jahreszeit',
      premium: 'Premium',
    },

    viewer: {
      title: 'Foto',
      comments: 'Kommentare',
      newComment: 'Neuer Kommentar',
      addComment: 'Hinzufügen',
      yourRating: 'Deine Bewertung:',
      showOnTheMap: 'Auf der Karte anzeigen',
      openInNewWindow: 'Öffnen in…',
      uploaded: ({ username, createdAt }) => (
        <>
          Hochgeladen von {username} am {createdAt}
        </>
      ),
      captured: (takenAt) => <>Aufgenommen am {takenAt}</>,
      deletePrompt: 'Dieses Bild löschen?',
      modify: 'Bearbeiten',
      premiumOnly:
        'Dieses Foto wurde vom Autor nur für Nutzer mit Premium-Zugang freigegeben.',
      noComments: 'Keine Kommentare',
    },

    editForm: {
      takenAt: {
        datetime: 'Aufnahmedatum und -zeit',
        date: 'Aufnahmedatum',
        time: 'Aufnahmezeit',
      },
      name: 'Name',
      description: 'Beschreibung',
      location: 'Ort',
      azimuth: 'Azimut',
      tags: 'Tags',
      setLocation: 'Ort festlegen',
    },

    uploadModal: {
      title: 'Fotos hochladen',
      uploading: (n) => `Wird hochgeladen (${n})`,
      upload: 'Hochladen',
      rules: `
        <p>Ziehe deine Fotos hierher oder klicke hier, um sie auszuwählen.</p>
        <ul>
          <li>Lade keine zu kleinen Bilder hoch (Thumbnails). Die maximale Auflösung ist nicht begrenzt, die maximale Dateigröße beträgt jedoch 10 MB. Größere Dateien werden abgelehnt.</li>
          <li>Lade nur Landschafts- oder Dokumentationsfotos hoch. Porträts und Makroaufnahmen gelten als unangemessener Inhalt und werden ohne Vorwarnung gelöscht.</li>
          <li>Lade nur eigene Fotos hoch oder solche, für die du eine Freigabe zur Veröffentlichung hast.</li>
          <li>Beschreibungen oder Kommentare, die nicht direkt mit dem Inhalt der hochgeladenen Fotos zusammenhängen oder den allgemein anerkannten Regeln des zivilisierten Zusammenlebens widersprechen, werden entfernt. Verstöße gegen diese Regel führen zu einer Verwarnung, bei wiederholtem Verstoß kann dein Konto gelöscht werden.</li>
          <li>Die Fotos werden unter der Lizenz CC BY-SA 4.0 weitergegeben.</li>
          <li>Der Betreiber (Freemap.sk) übernimmt keine Verantwortung und haftet nicht für direkte oder indirekte Schäden, die durch die Veröffentlichung eines Fotos in der Galerie entstehen. Die volle Verantwortung trägt die Person, die das Foto auf den Server hochgeladen hat.</li>
          <li>Der Betreiber behält sich das Recht vor, die Beschreibung, den Namen, die Position und die Tags eines Fotos zu ändern oder das Foto zu löschen, wenn dessen Inhalt unangemessen ist (diese Regeln verletzt).</li>
          <li>Der Betreiber behält sich das Recht vor, das Konto eines Nutzers zu löschen, wenn dieser wiederholt gegen die Galerie-Richtlinien durch das Hochladen unangemessener Inhalte verstößt.</li>
        </ul>
      `,
      success: 'Fotos wurden erfolgreich hochgeladen.',
      showPreview:
        'Vorschauen automatisch anzeigen (erhöht CPU- und Speicherbedarf)',
      premium: 'Nur für Nutzer mit Premiumzugang verfügbar machen',
      loadPreview: 'Vorschau laden',
    },
    locationPicking: {
      title: 'Fotoposition wählen',
    },

    filterModal: {
      title: 'Foto-Filter',
      tag: 'Tag',
      createdAt: 'Hochladedatum',
      takenAt: 'Aufnahmedatum',
      author: 'Autor',
      rating: 'Bewertung',
      noTags: 'keine Tags',
      pano: 'Panorama',
      premium: 'Premium',
    },

    allMyPhotos: {
      premium: 'Alle meine Fotos in Premium-Inhalte aufnehmen',
      free: 'Alle meine Fotos für alle zugänglich machen',
    },

    legend: 'Legende',
    recentTags: 'Kürzlich verwendete Tags:',
    filter: 'Filter',
    showPhotosFrom: 'Fotos anzeigen',
    showLayer: 'Ebene anzeigen',
    upload: 'Hochladen',
    colorizeBy: 'Einfärben nach',
    showDirection: 'Aufnahmerichtung anzeigen',

    deletingError: ({ err }) =>
      addError(messages, 'Fehler beim Löschen des Fotos', err),

    tagsFetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Tags', err),

    pictureFetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Laden des Fotos', err),

    picturesFetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Fotos', err),

    savingError: ({ err }) =>
      addError(messages, 'Fehler beim Speichern des Fotos', err),

    commentAddingError: ({ err }) =>
      addError(messages, 'Fehler beim Hinzufügen des Kommentars', err),

    ratingError: ({ err }) =>
      addError(messages, 'Fehler bei der Bewertung des Fotos', err),

    missingPositionError: 'Fehlende Position.',
    invalidPositionError: 'Ungültiges Koordinatenformat.',
    invalidTakenAt: 'Ungültiges Aufnahmedatum und -zeit.',
    noPicturesFound: 'An diesem Ort wurden keine Fotos gefunden.',
    linkToWww: 'Foto auf www.freemap.sk',
    linkToImage: 'Bilddatei des Fotos',
    showLegend: 'Farblegende anzeigen',
  },
  measurement: {
    distance: 'Linie',
    elevation: 'Punkt',
    area: 'Polygon',

    elevationFetchError: ({ err }) =>
      addError(
        messages,
        'Fehler beim Abrufen der Höheninformation des Punktes',
        err,
      ),

    elevationInfo: (params) => (
      <ElevationInfo
        {...params}
        lang="de"
        tileMessage="Kachel"
        maslMessage="Höhe"
      />
    ),
    areaInfo: (props) => (
      <AreaInfo {...props} areaLabel="Fläche" perimeterLabel="Umfang" />
    ),
    distanceInfo: (props) => <DistanceInfo {...props} lengthLabel="Länge" />,
  },

  trackViewer: {
    colorizingMode: {
      none: 'Inaktiv',
      elevation: 'Höhe',
      steepness: 'Steigung',
    },

    details: {
      startTime: 'Startzeit',
      finishTime: 'Zielzeit',
      duration: 'Dauer',
      distance: 'Entfernung',
      avgSpeed: 'Durchschnittsgeschwindigkeit',
      minEle: 'Min. Höhe',
      maxEle: 'Max. Höhe',
      uphill: 'Gesamtanstieg',
      downhill: 'Gesamtabstieg',
      durationValue: ({ h, m }) => `${h} Stunden ${m} Minuten`,
    },

    uploadModal: {
      title: 'Strecke hochladen',
      drop: 'Ziehen Sie Ihre .gpx-Datei hierher oder klicken Sie hier zur Auswahl.',
    },

    upload: 'Hochladen',
    moreInfo: 'Mehr Infos',
    share: 'Auf Server speichern',
    shareToast:
      'Die Strecke wurde auf dem Server gespeichert und kann über die URL der Seite geteilt werden.',
    fetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Streckendaten', err),
    savingError: ({ err }) =>
      addError(messages, 'Fehler beim Speichern der Strecke', err),
    loadingError: 'Fehler beim Laden der Datei.',
    onlyOne: 'Es wird nur eine einzelne GPX-Datei erwartet.',
    wrongFormat: 'Die Datei muss die Endung .gpx haben.',
    info: () => <TrackViewerDetails />,
    tooBigError: 'Die Datei ist zu groß.',
  },

  drawing: {
    edit: {
      title: 'Eigenschaften',
      color: 'Farbe',
      label: 'Beschriftung',
      width: 'Breite',
      hint: 'Um die Beschriftung zu entfernen, lassen Sie das Feld leer.',
      type: 'Geometrietyp',
    },

    defProps: {
      menuItem: 'Stileinstellungen',
      title: 'Standard-Stileinstellungen für Zeichnen',
      applyToAll: 'Speichern und auf alle anwenden',
    },

    projection: {
      projectPoint: 'Punkt projizieren',
      azimuth: 'Azimut',
      distance: 'Entfernung',
    },

    modify: 'Eigenschaften',
    continue: 'Fortfahren',
    join: 'Verbinden',
    split: 'Teilen',
    stopDrawing: 'Zeichnen beenden',
    selectPointToJoin: 'Punkt zum Verbinden der Linien wählen',
  },

  purchases: {
    purchases: 'Einkäufe',
    premiumExpired: (at) => <>Ihr Premium-Zugang ist am {at} abgelaufen</>,
    date: 'Datum',
    item: 'Artikel',
    notPremiumYet: 'Sie haben noch keinen Premium-Zugang.',
    noPurchases: 'Keine Einkäufe',
    premium: 'Premium',
    credits: (amount) => <>Credits ({amount})</>,
  },

  settings: {
    map: {
      homeLocation: {
        label: 'Heimatposition:',
        select: 'Auf der Karte auswählen',
        undefined: 'nicht festgelegt',
      },
    },

    account: {
      name: 'Name',
      email: 'E-Mail',
      sendGalleryEmails:
        'Benachrichtigungen zu Fotokommentaren per E-Mail erhalten',
      delete: 'Konto löschen',
      deleteWarning:
        'Möchten Sie Ihr Konto wirklich löschen? Dabei werden alle Ihre Fotos, Kommentare und Bewertungen, Ihre Karten und überwachten Geräte entfernt.',
      personalInfo: 'Persönliche Informationen',
      authProviders: 'Anmeldeanbieter',
    },

    general: {
      tips: 'Tipps beim Laden der Seite anzeigen (nur bei Spracheinstellung Slowakisch oder Tschechisch)',
    },

    layer: 'Karte',
    overlayOpacity: 'Deckkraft',
    showInMenu: 'Im Menü anzeigen',
    showInToolbar: 'In der Werkzeugleiste anzeigen',
    saveSuccess: 'Einstellungen wurden gespeichert.',
    savingError: ({ err }) =>
      addError(messages, 'Fehler beim Speichern der Einstellungen', err),
    customLayersDef: 'Definition benutzerdefinierter Kartenebenen',
    customLayersDefError:
      'Ungültige Definition benutzerdefinierter Kartenebenen.',
  },

  changesets: {
    details: {
      author: 'Autor:',
      description: 'Beschreibung:',
      noDescription: 'keine Beschreibung',
      closedAt: 'Zeit:',
      moreDetailsOn: ({ osmLink, achaviLink }) => (
        <p>
          Mehr Details auf {osmLink} oder {achaviLink}.
        </p>
      ),
    },

    allAuthors: 'Alle Autoren',
    tooBig:
      'Die Anfrage nach Changesets kann zu viele Einträge zurückgeben. Bitte zoomen Sie näher heran, wählen Sie weniger Tage oder geben Sie einen bestimmten Autor ein.',
    olderThan: ({ days }) => `${days} Tage`,
    olderThanFull: ({ days }) => `Changesets der letzten ${days} Tage`,
    notFound: 'Keine Changesets gefunden.',
    fetchError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Changesets', err),
    detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
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
  },

  objects: {
    lowZoomAlert: {
      message: ({ minZoom }) =>
        `Um Objekte nach Typ anzuzeigen, müssen Sie mindestens auf Zoomstufe ${minZoom} heranzoomen.`,
      zoom: 'Heranzoomen',
    },

    icon: {
      pin: 'Stecknadel',
      ring: 'Ring',
      square: 'Quadrat',
    },

    type: 'Typ',

    tooManyPoints: ({ limit }) =>
      `Das Ergebnis wurde auf ${limit} Objekte begrenzt.`,

    fetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Objekte (POIs)', err),
  },

  external: {
    openInExternal: 'Teilen / In externer App öffnen',
    osm: 'OpenStreetMap',
    oma: 'OMA',
    googleMaps: 'Google Maps',
    hiking_sk: 'Hiking.sk',
    zbgis: 'ZBGIS',
    mapy_cz: 'Mapy.com',
    josm: 'In JOSM bearbeiten',
    id: 'In iD bearbeiten',
    window: 'Neues Fenster',
    url: 'URL teilen',
    image: 'Foto teilen',
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
    },
  },

  embed: {
    code: 'Füge den folgenden Code in deine HTML-Seite ein:',
    example: 'Das Ergebnis wird folgendermaßen aussehen:',
    dimensions: 'Größe',
    height: 'Höhe',
    width: 'Breite',
    enableFeatures: 'Funktionen aktivieren',
    enableSearch: 'Suche',
    enableMapSwitch: 'Kartenebenen wechseln',
    enableLocateMe: 'Standort ermitteln',
  },

  documents: {
    errorLoading: 'Fehler beim Laden des Dokuments.',
  },
  exportMapFeatures: {
    what: {
      plannedRoute: 'gefundene Route',
      plannedRouteWithStops: 'inklusive Stopps',
      objects: 'Objekte (POIs)',
      pictures: 'Fotos (im sichtbaren Kartenbereich)',
      drawingLines: 'Zeichnung – Linien',
      drawingAreas: 'Zeichnung – Polygone',
      drawingPoints: 'Zeichnung – Punkte',
      tracking: 'Live-Tracking',
      gpx: 'GPX-Track',
      search: 'hervorgehobenes Kartenelement',
    },
    garmin: {
      at: {
        running: 'Laufen',
        hiking: 'Wandern',
        other: 'Sonstiges',
        mountain_biking: 'Mountainbike',
        trailRunning: 'Trailrunning',
        roadCycling: 'Straßenradsport',
        gravelCycling: 'Gravelbike',
      },
      courseName: 'Kursname',
      description: 'Beschreibung',
      activityType: 'Aktivitätstyp',
      revoked: 'Export des Kurses zu Garmin wurde widerrufen.',
      connectPrompt:
        'Dein Garmin-Konto ist noch nicht verbunden. Möchtest du es jetzt verbinden?',
      authPrompt:
        'Du bist noch nicht bei Garmin angemeldet. Möchtest du dich jetzt anmelden?',
    },
    download: 'Download',
    format: 'Format',
    target: 'Ziel',
    exportError: ({ err }) =>
      addError(messages, 'Fehler beim Exportieren', err),
    disabledAlert:
      'Nur Checkboxen mit exportierbaren Elementen auf der Karte sind aktiviert.',
    licenseAlert:
      'Es können verschiedene Lizenzen gelten – z. B. OpenStreetMap. Bitte beachte fehlende Quellenangaben beim Teilen der exportierten Datei.',
    exportedToDropbox: 'Datei wurde in Dropbox gespeichert.',
    exportedToGdrive: 'Datei wurde in Google Drive gespeichert.',
  },

  auth: {
    provider: {
      facebook: 'Facebook',
      google: 'Google',
      osm: 'OpenStreetMap',
      garmin: 'Garmin',
    },
    connect: {
      label: 'Verbinden',
      success: 'Verbunden',
    },
    disconnect: {
      label: 'Trennen',
      success: 'Getrennt',
    },
    logIn: {
      with: 'Wähle einen Anmeldeanbieter',
      success: 'Du wurdest erfolgreich angemeldet.',
      logInError: ({ err }) =>
        addError(messages, 'Fehler bei der Anmeldung', err),
      logInError2: 'Fehler bei der Anmeldung.',
      verifyError: ({ err }) =>
        addError(messages, 'Fehler bei der Authentifizierungsprüfung', err),
    },
    logOut: {
      success: 'Du wurdest erfolgreich abgemeldet.',
      error: ({ err }) => addError(messages, 'Fehler bei der Abmeldung', err),
    },
  },

  mapLayers: {
    letters: {
      A: 'Auto',
      T: 'Wandern',
      C: 'Fahrrad',
      K: 'Skilanglauf',
      S: 'Luftbild',
      Z: 'Luftbild',
      J1: 'Ortofotomozaika SR (1. Zyklus)',
      J2: 'Ortofotomozaika SR (2. Zyklus)',
      O: 'OpenStreetMap',
      d: 'Öffentlicher Verkehr (ÖPNV)',
      X: outdoorMap,
      i: 'Datenschicht',
      I: 'Fotos',
      l1: 'Forststraßen NLC (2017)',
      l2: 'Forststraßen NLC',
      t: 'Wanderwege',
      c: 'Radwege',
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
    settings: 'Karteneinstellungen',
    layers: 'Karten',
    switch: 'Karten',
    photoFilterWarning: 'Fotofilter ist aktiv',
    interactiveLayerWarning: 'Datenschicht ist ausgeblendet',
    minZoomWarning: (minZoom) => `Verfügbar ab Zoomstufe ${minZoom}`,
    customBase: 'Benutzerdefinierte Karte',
    customMaps: 'Benutzerdefinierte Karten',
    base: 'Grundlegende Ebenen',
    overlay: 'Überlagerungsebenen',
    url: 'URL-Vorlage',
    minZoom: 'Min. Zoomstufe',
    maxNativeZoom: 'Max. native Zoomstufe',
    extraScales: 'Zusätzliche Auflösungen',
    scaleWithDpi: 'Mit DPI skalieren',
    zIndex: 'Z-Index',
    generalSettings: 'Allgemeine Einstellungen',
    maxZoom: 'Maximale Zoomstufe',
    layer: {
      layer: 'Ebene',
      base: 'Basis',
      overlay: 'Overlay',
    },
    showMore: 'Mehr Karten anzeigen',
    countryWarning: (countries) =>
      `Deckt nur folgende Länder ab: ${countries.join(', ')}`,
    layerSettings: 'Kartenebenen',
    technologies: {
      tile: 'Bildkacheln (TMS, XYZ)',
      maplibre: 'Vektor (MapLibre)',
      wms: 'WMS',
      parametricShading: 'Parametrische Schattierung',
    },
    technology: 'Typ',
    loadWmsLayers: 'Layer laden',
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
  osm: {
    fetchingError: ({ err }) =>
      addError(messages, 'Fehler beim Abrufen von OSM-Daten', err),
  },

  tracking: {
    trackedDevices: {
      button: 'Beobachtet',
      modalTitle: 'Beobachtete Geräte',
      desc: 'Verwalte beobachtete Geräte, um die Position deiner Freunde zu sehen.',
      modifyTitle: (name) => (
        <>
          Beobachtetes Gerät bearbeiten <i>{name}</i>
        </>
      ),
      createTitle: (name) => (
        <>
          Gerät beobachten <i>{name}</i>
        </>
      ),
      storageWarning:
        'Bitte beachte, dass die Geräteliste nur in der Seiten-URL enthalten ist. Wenn du sie speichern möchtest, nutze die Funktion „Meine Karten“.',
    },

    accessToken: {
      token: 'Beobachtungs-Token',
      timeFrom: 'Von',
      timeTo: 'Bis',
      listingLabel: 'Gerätename',
      note: 'Notiz',
      delete: 'Zugriffstoken löschen?',
    },

    accessTokens: {
      modalTitle: (deviceName) => (
        <>
          Beobachtungs-Tokens für <i>{deviceName}</i>
        </>
      ),

      desc: (deviceName) => (
        <>
          Definieren Sie Beobachtungs-Tokens, um die Position Ihres Geräts{' '}
          <i>{deviceName}</i> mit Ihren Freunden zu teilen.
        </>
      ),

      createTitle: (deviceName) => (
        <>
          Beobachtungs-Token hinzufügen für <i>{deviceName}</i>
        </>
      ),

      modifyTitle: ({ token, deviceName }) => (
        <>
          Beobachtungs-Token <i>{token}</i> bearbeiten für <i>{deviceName}</i>
        </>
      ),
    },
    trackedDevice: {
      token: 'Beobachtungs-Token',
      label: 'Bezeichnung',
      fromTime: 'Seit',
      maxAge: 'Maximales Alter',
      maxCount: 'Maximale Anzahl',
      splitDistance: 'Distanzaufteilung',
      splitDuration: 'Zeitaufteilung',
      color: 'Farbe',
      width: 'Breite',
    },
    devices: {
      button: 'Meine Geräte',
      modalTitle: 'Meine verfolgten Geräte',
      createTitle: 'Verfolgungsgerät erstellen',
      watchTokens: 'Beobachtungstoken',
      watchPrivately: 'Privat beobachten',
      watch: 'Beobachten',
      delete: 'Gerät löschen?',
      modifyTitle: ({ name }) => (
        <>
          Verfolgungsgerät bearbeiten <i>{name}</i>
        </>
      ),
      desc: () => (
        <>
          <p>
            Verwalten Sie Ihre Geräte, damit andere Ihre Position sehen können,
            wenn Sie ihnen einen Beobachtungstoken geben (kann über das{' '}
            <FaKey />
            -Symbol erstellt werden).
          </p>
          <hr />
          <p>
            Geben Sie die folgende URL in Ihrem Tracker ein (z. B.{' '}
            <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
              Locus
            </a>{' '}
            oder OsmAnd):{' '}
            <code>
              {process.env['API_URL']}/tracking/track/<i>token</i>
            </code>{' '}
            wobei <i>token</i> in der untenstehenden Tabelle aufgelistet ist.
          </p>
          <p>
            Der Endpunkt unterstützt HTTP-Methoden <code>GET</code> oder{' '}
            <code>POST</code> mit URL-kodierten Parametern:
          </p>
          <ul>
            <li>
              <code>lat</code> – Breitengrad in Grad (erforderlich)
            </li>
            <li>
              <code>lon</code> – Längengrad in Grad (erforderlich)
            </li>
            <li>
              <code>time</code>, <code>timestamp</code> – in JavaScript
              parsierbares Datum oder Unix-Zeit in Sekunden oder Millisekunden
            </li>
            <li>
              <code>alt</code>, <code>altitude</code> – Höhe in Metern
            </li>
            <li>
              <code>speed</code> – Geschwindigkeit in m/s
            </li>
            <li>
              <code>speedKmh</code> – Geschwindigkeit in km/h
            </li>
            <li>
              <code>acc</code> – Genauigkeit in Metern
            </li>
            <li>
              <code>hdop</code> – horizontale Positionsgenauigkeit (HDOP)
            </li>
            <li>
              <code>bearing</code> – Richtung in Grad
            </li>
            <li>
              <code>battery</code> – Akkustand in Prozent
            </li>
            <li>
              <code>gsm_signal</code> – GSM-Signal in Prozent
            </li>
            <li>
              <code>message</code> – Nachricht (Notiz)
            </li>
          </ul>
          <hr />
          <p>
            Im Fall eines TK102B-Trackers konfigurieren Sie die Adresse auf:{' '}
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
      token: 'Tracking-Token',
      name: 'Name',
      maxAge: 'Maximales Alter',
      maxCount: 'Maximale Anzahl',
      generatedToken: 'wird beim Speichern generiert',
    },
    visual: {
      line: 'Linie',
      points: 'Punkte',
      'line+points': 'Linie + Punkte',
    },
    subscribeNotFound: ({ id }) => (
      <>
        Beobachtungstoken <i>{id}</i> existiert nicht.
      </>
    ),

    subscribeError: ({ id }) => (
      <>
        Fehler beim Beobachten mit Token <i>{id}</i>.
      </>
    ),
  },
  mapExport: {
    areas: {
      visible: 'Sichtbarer Kartenbereich',
      pinned: 'Bereich mit ausgewähltem Polygon (Zeichnung)',
    },

    advancedSettings: 'Erweiterte Optionen',
    styles: 'Stile der Datenschicht',

    exportError: ({ err }) =>
      addError(messages, 'Fehler beim Kartenexport', err),

    exporting: 'Bitte warten, Karte wird exportiert…',

    exported: ({ url }) => (
      <>
        Kartenexport abgeschlossen.{' '}
        <AlertLink href={url} target="_blank">
          Öffnen.
        </AlertLink>
      </>
    ),

    area: 'Exportbereich',
    format: 'Format',
    layersTitle: 'Optionale Ebenen',
    layers: {
      contours: 'Höhenlinien',
      shading: 'Schattiertes Relief',
      hikingTrails: 'Wanderwege',
      bicycleTrails: 'Radwege',
      skiTrails: 'Skipisten',
      horseTrails: 'Reitwege',
      drawing: 'Zeichnung',
      plannedRoute: 'Gefundene Route',
      track: 'GPX-Track',
    },
    mapScale: 'Kartenauflösung',

    alert: (licence) => (
      <>
        Hinweise:
        <ul>
          <li>
            Exportiert wird die Karte <i>{outdoorMap}</i>.
          </li>
          <li>Der Kartenexport kann mehrere Sekunden dauern.</li>
          <li>
            Vor der Veröffentlichung der exportierten Karte geben Sie bitte die
            folgende Lizenz an:
            <br />
            <em>{licence}</em>
          </li>
        </ul>{' '}
      </>
    ),
  },
  maps: {
    legacy: 'veraltet',
    legacyMapWarning: ({ from, to }) => (
      <>
        Die angezeigte Karte <b>{messages.mapLayers.letters[from]}</b> ist
        veraltet. Zur modernen <b>{messages.mapLayers.letters[to]}</b>wechseln?
      </>
    ),
    noMapFound: 'Keine Karte gefunden',
    save: 'Speichern',
    delete: 'Löschen',
    disconnect: 'Trennen',
    deleteConfirm: (name) => `Möchten Sie die Karte ${name} wirklich löschen?`,
    fetchError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Karte', err),
    fetchListError: ({ err }) =>
      addError(messages, 'Fehler beim Laden der Karten', err),
    deleteError: ({ err }) =>
      addError(messages, 'Fehler beim Löschen der Karte', err),
    renameError: ({ err }) =>
      addError(messages, 'Fehler beim Umbenennen der Karte', err),
    createError: ({ err }) =>
      addError(messages, 'Fehler beim Speichern der Karte', err),
    saveError: ({ err }) =>
      addError(messages, 'Fehler beim Speichern der Karte', err),
    loadToEmpty: 'In leere Karte laden',
    loadInclMapAndPosition:
      'Mit gespeicherter Hintergrundkarte und Position laden',
    savedMaps: 'Gespeicherte Karten',
    newMap: 'Neue Karte',
    SomeMap: ({ name }) => (
      <>
        Karte <i>{name}</i>
      </>
    ),
    writers: 'Bearbeiter',
    conflictError: 'Die Karte wurde inzwischen geändert.',
    addWriter: 'Editor hinzufügen',
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
  legend: {
    body: ({ name }) => (
      <>
        Kartenlegende für <i>{name}</i>
      </>
    ),
    outdoorMap: {
      accommodation: 'Unterkunft',
      'gastro-poi': 'Essen und Trinken',
      institution: 'Institutionen',
      sport: 'Sport',
      'natural-poi': 'Naturmerkmale',
      poi: 'Weitere Sehenswürdigkeiten',
      landcover: 'Landbedeckung',
      borders: 'Grenzen',
      'roads-and-paths': 'Straßen und Wege',
      railway: 'Eisenbahnen',
      terrain: 'Gelände',
      water: 'Wasser',
      other: 'Andere',
    },
  },
  contacts: {
    ngo: 'Eingetragener Verein',
    registered: 'Registriert bei MV/VVS/1-900/90-34343 am 02.10.2009',
    bankAccount: 'Bankverbindung',
    generalContact: 'Allgemeine Kontakte',
    board: 'Vorstand',
    boardMemebers: 'Vorstandsmitglieder',
    president: 'Vorsitzender',
    vicepresident: 'Stellvertretender Vorsitzender',
    secretary: 'Schriftführer',
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
            title="Strava Heatmap, hochauflösende detaillierte Schummerung der Slowakei und Tschechiens, höchste Zoomstufen der Outdoor-Karte, höchste Zoomstufen der Orthofotokarten der Slowakei und Tschechiens, verschiedene WMS-basierte Karten"
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
  },
  credits: {
    buyCredits: 'Credits kaufen',
    amount: 'Credits',
    credits: 'Credits',
    buy: 'Kaufen',

    purchase: {
      success: ({ amount }) => (
        <>Dein Guthaben wurde um {nf00.format(amount)} erhöht.</>
      ),
    },

    youHaveCredits: (amount, explainCredits) => (
      <>
        Sie haben {amount}{' '}
        {explainCredits ? (
          <CreditsText
            credits="Credits"
            help="Sie können Credits verwenden, um [Export von Offline-Karten]."
          />
        ) : (
          'Credits'
        )}
        .
      </>
    ),
  },
  offline: {
    offlineMode: 'Offline-Modus',
    cachingActive: 'Zwischenspeicherung aktiv',
    clearCache: 'Cache leeren',
    dataSource: 'Datenquelle',
    networkOnly: 'Nur Netzwerk',
    networkFirst: 'Zuerst Netzwerk',
    cacheFirst: 'Zuerst Cache',
    cacheOnly: 'Nur Cache',
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
  downloadMap: {
    downloadMap: 'Export von Offline-Karten',
    format: 'Format',
    map: 'Karte',
    downloadArea: 'Exportieren',
    area: {
      visible: 'Sichtbarer Bereich',
      byPolygon: 'Bereich mit ausgewähltem Polygon',
    },
    name: 'Name',
    zoomRange: 'Zoom-Bereich',
    scale: 'Maßstab',
    email: 'Ihre E-Mail-Adresse',
    emailInfo:
      'Wir verwenden Ihre E-Mail, um Ihnen den Download-Link zu senden.',
    success:
      'Die Karte wird vorbereitet. Sobald sie fertig ist, erhalten Sie einen Download-Link per E-Mail.',
    summaryTiles: 'Kacheln',
    summaryPrice: (amount) => <>Gesamtpreis: {amount} Credits</>,
  },
};

export default messages;
