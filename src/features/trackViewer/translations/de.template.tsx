import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const de: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
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
    sourceFilledGaps: 'aufgezeichnet, Lücken ergänzt (NASA SRTM)',
    sourceFilled: 'NASA-SRTM-Geländemodell',
  },
  uploadModal: {
    title: 'Datei importieren',
    drop: 'Ziehen Sie eine GPX-, KML-, KMZ-, TCX- oder GeoJSON-Datei hierher oder klicken Sie hier zur Auswahl.',
    mergeTitle: 'Daten bereits geladen',
    mergeMessage:
      'Es werden bereits Geodaten angezeigt. Die importierten Daten anhängen oder ersetzen?',
    append: 'Anhängen',
    replace: 'Ersetzen',
  },
  elevationFill: {
    title: 'Höhendaten',
    introNone: 'Diese Spur enthält keine Höhendaten.',
    introPartial: 'Bei einigen Punkten dieser Spur fehlt die Höhe.',
    introFull:
      'Diese Spur hat bereits Höhendaten, aber das NASA-SRTM-Modell (~30 m) ' +
      'ist oft genauer.',
    question: 'Was möchten Sie tun?',
    overrideAll: 'Alle überschreiben',
    overrideAllDesc:
      'jeden Punkt aus dem SRTM-Geländemodell ersetzen — ein glattes, ' +
      'einheitliches Profil',
    fillMissing: 'Fehlende ergänzen',
    fillMissingDesc:
      'die aufgezeichneten Werte behalten und nur die Lücken füllen (an den ' +
      'Übergängen kann es Stufen geben)',
    keep: 'Nichts ändern',
    keepDesc: 'die in der Spur gespeicherte Höhe verwenden',
    add: 'Höhe ergänzen',
    update: 'Höhe aktualisieren',
    updateConfirm:
      'Die Höhe der Spur durch das NASA-SRTM-Geländemodell (~30 m) ersetzen?',
    updatedToast: ({ mode }) =>
      mode === 'missing'
        ? 'Fehlende Höhe wurde ergänzt.'
        : 'Die Höhe wurde überschrieben.',
  },
  upload: 'Hochladen',
  trackLabel: 'Track',
  unnamedTrack: ({ n }) => `Track ${n}`,
  convertLossWarning:
    'Beim Umwandeln in eine Zeichnung wird der Track ersetzt und seine aufgezeichneten Daten (Höhe, Herzfrequenz, Geschwindigkeit, Zeit) verworfen.',
  moreInfo: 'Mehr Infos',
  saveAsMap: 'In meinen Karten speichern',
  loginToSaveMap:
    'Melde dich zuerst an, um die Strecke in deinen Karten zu speichern.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Streckendaten', err),
  loadingError: 'Fehler beim Laden der Datei.',
  onlyOne: 'Es wird nur eine einzelne Datei erwartet.',
  invalidFormat: 'Die Datei hat kein unterstütztes Format oder ist ungültig.',
  someFilesFailed: ({ names }) =>
    `Einige Dateien konnten nicht geladen werden: ${names}.`,
};

export default de;
