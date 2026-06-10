import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const de: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  what: {
    plannedRoute: 'gefundene Route',
    plannedRouteWithStops: 'inklusive Stopps',
    objects: 'Objekte (POIs)',
    pictures: 'Fotos (im sichtbaren Kartenbereich)',
    drawingLines: 'Zeichnung – Linien',
    drawingAreas: 'Zeichnung – Polygone',
    drawingPoints: 'Zeichnung – Punkte',
    tracking: 'Live-Tracking',
    import: 'Importierte Datei',
    search: 'Fund',
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
    addError(getMessages()!, 'Fehler beim Exportieren', err),
  disabledAlert:
    'Nur Optionen mit exportierbaren Elementen auf der Karte sind aktiviert.',
  licenseAlert:
    'Es können verschiedene Lizenzen gelten – z. B. OpenStreetMap. Bitte beachte fehlende Quellenangaben beim Teilen der exportierten Datei.',
  exportedToDropbox: 'Datei wurde in Dropbox gespeichert.',
  exportedToGdrive: 'Datei wurde in Google Drive gespeichert.',
};

export default de;
