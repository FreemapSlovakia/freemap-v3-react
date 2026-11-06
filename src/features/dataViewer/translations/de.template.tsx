import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { DataViewerDetails } from '../components/DataViewerDetails.js';
import type { DataViewerMessages } from './DataViewerMessages.js';

const de: DeepPartialWithRequiredObjects<DataViewerMessages> = {
  vertex: {
    menuItem: 'Punktdaten',
    latitude: 'Breitengrad',
    longitude: 'Längengrad',
    elevation: 'Höhe',
    time: 'Zeit',
    filled: ({ filled, total }) => `${filled} von ${total} Punkten`,
    emptyHint:
      'Ein leeres Feld lässt den Punkt ohne diesen Wert. Welche Werte die Linie hat, wird in ihren Eigenschaften festgelegt.',
    notANumber: 'Geben Sie eine Zahl ein.',
    outOfRange: 'Außerhalb des Bereichs.',
    timeOrder:
      'Die Zeit muss zwischen den Zeiten des vorherigen und des nächsten Punkts liegen.',
    channels: {
      heart: 'Herzfrequenz',
      cads: 'Trittfrequenz',
      atemps: 'Lufttemperatur',
      wtemps: 'Wassertemperatur',
      depths: 'Tiefe',
      speeds: 'Geschwindigkeit',
      courses: 'Bewegungsrichtung',
      bearings: 'Azimut',
      powers: 'Leistung',
      accuracies: 'Genauigkeit',
      battery: 'Akku',
      gsmSignal: 'GSM-Signal',
    },
  },
  split: {
    action: 'Teilen',
    pick: 'Klicken Sie auf die Spur an der Trennstelle',
    here: 'Hier teilen',
  },
  join: {
    action: 'Verbinden',
    asLine: 'Zu einer Linie verbinden',
    asSegments: 'Verbinden, Abschnitte behalten',
    pick: 'Klicken Sie auf die Spur, die angehängt werden soll',
    pickEnd: 'Punkt zum Verbinden der Linien wählen',
  },
  osmUpload: {
    visibilities: {
      identifiable: 'Identifizierbar',
      public: 'Öffentlich',
      trackable: 'Nachverfolgbar',
      private: 'Privat',
    },
    visibilityHints: {
      identifiable:
        'In der Trackliste mit Ihrem Namen angezeigt, als geordnete Punkte mit Zeitstempeln.',
      public:
        'In der Trackliste mit Ihrem Namen angezeigt, als anonyme, ungeordnete Punkte.',
      trackable: 'Nur als anonyme, geordnete Punkte mit Zeitstempeln geteilt.',
      private: 'Nur als anonyme, ungeordnete Punkte geteilt.',
    },
    menuItem: 'GPS-Track zu OpenStreetMap hochladen',
    title: 'GPS-Track zu OpenStreetMap hochladen',
    help: 'Lädt die geladenen Tracks als GPS-Track in Ihr OpenStreetMap-Konto hoch, anhand dessen Mapper Wege einzeichnen können. Hochgeladen werden nur Tracks mit aufgezeichneten Zeiten, da OpenStreetMap andere nicht speichert. Laden Sie nur selbst aufgezeichnete Tracks hoch.',
    description: 'Beschreibung',
    tags: 'Tags',
    tagsHint: 'Durch Kommas getrennt.',
    tagsInvalid:
      'OpenStreetMap akzeptiert in einem Tag weder . ; / ? % noch # und keinen Tag mit mehr als 255 Zeichen.',
    visibility: 'Sichtbarkeit',
    upload: 'Hochladen',
    loginPrompt:
      'Zum Hochladen müssen Sie sich mit OpenStreetMap anmelden und Freemap erlauben, GPS-Tracks hochzuladen. Fortfahren?',
    connectPrompt:
      'Zum Hochladen müssen Sie Ihr OpenStreetMap-Konto mit Ihrem Freemap-Konto verbinden und Freemap erlauben, GPS-Tracks dorthin hochzuladen. Falls Sie bereits ein anderes Freemap-Konto haben, bei dem Sie sich mit diesem OpenStreetMap-Konto anmelden, werden die beiden Konten zu einem zusammengeführt. Fortfahren?',
    authorizePrompt:
      'Zum Hochladen müssen Sie Freemap erlauben, GPS-Tracks in Ihr OpenStreetMap-Konto hochzuladen. Fortfahren?',
    reauthorize:
      'Die Berechtigung von Freemap, GPS-Tracks in Ihr OpenStreetMap-Konto hochzuladen, wurde soeben widerrufen. Klicken Sie erneut auf Hochladen, um sie zu erteilen.',
    success: ({ url }) => (
      <>
        Der Track wurde hochgeladen. OpenStreetMap verarbeitet ihn innerhalb
        weniger Minuten.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Track auf OpenStreetMap anzeigen
        </a>
      </>
    ),
  },
  match: {
    menuItem: 'An Wege anpassen',
    title: 'An Wege anpassen',
    help: 'Legt den Track auf das erfasste Wegenetz, was GPS-Streuung beseitigt und — darum geht es — ermittelt, worüber der Track führt, sodass er nach Belag, Wegtyp, Wegqualität und Schwierigkeit eingefärbt werden kann.',
    transport: 'Fortbewegung',
    dataLoss:
      'Die angepasste Linie hat eigene Punkte, daher gehen Zeitstempel und aufgezeichnete Sensordaten (Herzfrequenz, Trittfrequenz, Geschwindigkeit) verloren.',
    run: 'Anpassen',
    tooLong: 'Dieser Track hat zu viele Punkte für die Anpassung.',
    tooShort: 'Der Track ist zu kurz zum Anpassen.',
    brokenSequence:
      'Der Track verlässt irgendwo das erfasste Wegenetz und kann daher nicht angepasst werden. Versuchen Sie eine andere Fortbewegung oder lassen Sie den Track, wie er ist.',
    offNetwork:
      'Die angepasste Route wurde viel länger als der Track, was bedeutet, dass der Track nicht erfassten Wegen folgte — etwa über eine Wiese. Die Anpassung kann nur mit vorhandenen Wegen antworten, das Ergebnis wäre also nicht Ihr Weg. Der Track bleibt unverändert.',
    partial:
      'Einige Teile des Tracks konnten nicht angepasst werden — sie bleiben, wie sie aufgezeichnet wurden. Ein Track, der unterwegs die Fortbewegung wechselt (eine Wanderung, dann die Heimfahrt), muss zuerst geteilt werden.',
  },
  info: () => <DataViewerDetails />,
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
    source: 'Höhenquelle',
    sourceOriginal: 'aufgezeichnet',
    sourcePartial: 'aufgezeichnet, unvollständig',
    sourceFilledGaps: 'aufgezeichnet, Lücken ergänzt (Geländemodell)',
    sourceFilled: 'Geländemodell',
  },
  uploadModal: {
    title: 'Datei importieren',
    drop: 'Ziehen Sie eine GPX-, KML-, KMZ-, TCX- oder GeoJSON-Datei hierher oder klicken Sie hier zur Auswahl.',
    mergeTitle: 'Daten bereits geladen',
    mergeMessage:
      'Es werden bereits Geodaten angezeigt. Die importierten Daten anhängen oder ersetzen?',
    existingData: 'Vorhandene Daten',
    append: 'Anhängen',
    replace: 'Ersetzen',
  },
  trace: {
    streams: 'Gewässerverfolgung',
    forests: 'Waldverfolgung',
    streamsHelp:
      'Dient dazu, im gewählten Polygon Gewässerlinien aus dem hochauflösenden Geländemodell abzuleiten. Geeignet zum Erfassen in OpenStreetMap.',
    forestsHelp:
      'Dient dazu, im gewählten Polygon die Flächen nachzuzeichnen, die die ausgewählten LiDAR-Punktklassen bedecken. Geeignet vor allem zum Erfassen der Bodenbedeckung in OpenStreetMap.',
    pixelSize: 'Pixelgröße',
    pixelSizeHint: 'Leer für die eigene Auflösung des Geländemodells.',
    threshold: 'Minimale Einzugsgebietsfläche',
    minLength: 'Minimale Gewässerlänge',
    simplify: 'Vereinfachungstoleranz',
    classes: 'Punktklassen',
    classNames: {
      lowVegetation: 'Niedrige Vegetation',
      mediumVegetation: 'Mittlere Vegetation',
      highVegetation: 'Hohe Vegetation',
      building: 'Gebäude',
      water: 'Wasser',
    },
    output: 'Ergebnis',
    outputJosm: 'In JOSM öffnen',
    outputOsm: 'Als OSM XML herunterladen',
    outputGeojson: 'Als GeoJSON herunterladen',
    tooBig: ({ max }) =>
      `Das Polygon ist zu groß; die Grenze liegt bei ${max}.`,
    run: 'Nachzeichnen',
    legacy: ({ phrase, item }) => (
      <>
        Verwenden Sie statt des <i>Easter Eggs</i> <code>{phrase}</code> den
        Eintrag <i>{item}</i> im ⋮-Menü des ausgewählten Polygons.
      </>
    ),
  },
  elevationFill: {
    title: 'Höhendaten',
    introNone: 'Es sind noch keine Höhendaten vorhanden.',
    introPartial: 'Bei einigen Punkten fehlt die Höhe.',
    introFull:
      'Höhendaten sind bereits vorhanden, aber ein Geländemodell ist oft ' +
      'genauer.',
    premiumHiRes: (premiumLink, countries) => (
      <>
        Mit {premiumLink('Premium-Zugang')} werden die Höhendaten in{' '}
        {countries('vielen europäischen Ländern')} aus hochauflösenden
        nationalen Geländemodellen abgetastet.
      </>
    ),
    question: 'Was möchten Sie tun?',
    overrideAll: 'Alle überschreiben',
    overrideAllDesc:
      'jeden Punkt aus dem Geländemodell ersetzen — ein glattes, ' +
      'einheitliches Profil',
    fillMissing: 'Fehlende ergänzen',
    fillMissingDesc:
      'die aufgezeichneten Werte behalten und nur die Lücken füllen (an den ' +
      'Übergängen kann es Stufen geben)',
    keep: 'Nichts ändern',
    keepDesc: 'die in der Spur gespeicherte Höhe verwenden',
    add: 'Höhe ergänzen',
    update: 'Höhe aktualisieren',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Fehlende Höhe wurde ergänzt.'
        : mode === 'clear'
          ? 'Die Höhe wurde entfernt.'
          : 'Die Höhe wurde überschrieben.',
    clear: 'Höhe entfernen',
    clearDesc:
      'die gespeicherte Höhe entfernen; Profile lesen sie dann aus dem Geländemodell',
  },
  upload: 'Hochladen',
  unnamedTrack: ({ n }) => `Track ${n}`,
  simplifyAll: 'Alles vereinfachen',
  moreInfo: 'Mehr Infos',
  breakApart: 'In Teile zerlegen',
  saveAsMap: 'In meinen Karten speichern',
  loginToSaveMap:
    'Melden Sie sich zuerst an, um die Strecke in Ihren Karten zu speichern.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Streckendaten', err),
  matchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Anpassen des Tracks', err),
  loadingError: 'Fehler beim Laden der Datei.',
  onlyOne: 'Es wird nur eine einzelne Datei erwartet.',
  invalidFormat: 'Die Datei hat kein unterstütztes Format oder ist ungültig.',
  someFilesFailed: ({ names }) =>
    `Einige Dateien konnten nicht geladen werden: ${names}.`,
  snapshotGone:
    'Die in diesem Schritt angezeigten Daten werden in diesem Browser nicht mehr aufbewahrt.',
  snapshotFailed:
    'Dieser Browser konnte die Daten nicht aufbewahren, beim Neuladen der Seite gehen sie daher verloren. Speichern Sie sie in Ihren Karten, um sie zu behalten.',
  osmUploadError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Hochladen zu OpenStreetMap', err),
};

export default de;
