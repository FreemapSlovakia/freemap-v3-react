import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { TrackViewerDetails } from '../components/TrackViewerDetails.js';
import { TrackViewerMessages } from './TrackViewerMessages.js';

const de: DeepPartialWithRequiredObjects<TrackViewerMessages> = {
  info: () => <TrackViewerDetails />,
  colorizingMode: {
    none: 'Inaktiv',
    elevation: 'Höhe',
    steepness: 'Steigung',
    speed: 'Geschwindigkeit',
    heartRate: 'Herzfrequenz',
    cadence: 'Trittfrequenz',
    power: 'Leistung',
    temperature: 'Temperatur',
    time: 'Zeit',
    heading: 'Richtung',
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
    title: 'Datei importieren',
    drop: 'Ziehen Sie eine GPX- oder GeoJSON-Datei hierher oder klicken Sie hier zur Auswahl.',
  },
  elevationFill: {
    title: 'Höhe ergänzen',
    message:
      'Diese Spur enthält keine Höhendaten. Vom Server ergänzen? ' +
      '„Alle überschreiben“ ergibt ein glatteres, einheitliches Profil; ' +
      '„Fehlende ergänzen“ behält die aufgezeichneten Werte.',
    fillMissing: 'Fehlende ergänzen',
    overrideAll: 'Alle überschreiben',
  },
  upload: 'Hochladen',
  moreInfo: 'Mehr Infos',
  share: 'Auf Server speichern',
  shareToast:
    'Die Strecke wurde auf dem Server gespeichert und kann über die URL der Seite geteilt werden.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Streckendaten', err),
  savingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Strecke', err),
  loadingError: 'Fehler beim Laden der Datei.',
  onlyOne: 'Es wird nur eine einzelne Datei erwartet.',
  invalidFormat: 'Die Datei hat kein unterstütztes Format oder ist ungültig.',
  tooBigError: 'Die Datei ist zu groß.',
};

export default de;
