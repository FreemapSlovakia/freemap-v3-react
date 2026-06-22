import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const en: MapFeaturesExportMessages = {
  download: 'Download',
  format: 'Format',
  target: 'Target',
  elevation: {
    label: 'Elevation',
    none: 'Keep recorded',
    missing: 'Fill missing',
    all: 'Override all',
  },
  exportError: ({ err }) => addError(getMessages()!, 'Error exporting', err),
  what: {
    plannedRoute: 'found route',
    plannedRouteWithStops: 'include stops',
    objects: 'objects (POIs)',
    pictures: 'photos (in the visible map area)',
    drawingLines: 'drawing - lines',
    drawingAreas: 'drawing - polygons',
    drawingPoints: 'drawing - points',
    tracking: 'live tracking',
    import: 'imported file',
    search: 'lookup',
  },
  disabledAlert:
    'Only items that have something on the map to export are enabled.',
  licenseAlert:
    'Various licenses may apply - like OpenStreetMap. Please add missing attributions upon sharing exported file.',
  exportedToDropbox: 'File has been saved to Dropboxu.',
  exportedToGdrive: 'File has been saved to Google Drive.',
  garmin: {
    courseName: 'Course name',
    description: 'Description',
    activityType: 'Activity type',
    at: {
      running: 'Running',
      hiking: 'Hiking',
      other: 'Other',
      mountain_biking: 'Mountain biking',
      trailRunning: 'Trail running',
      roadCycling: 'Road cycling',
      gravelCycling: 'Gravel cycling',
    },
    revoked: 'Exporting course to Garmin has been revoked.',
    exportError: 'Error exporting to Garmin.',
    multipleLineStrings:
      'The selection contains more than a single continuous line.',
    noLineString: 'The selection contains no continuous line.',
    multipleTracks: 'Multiple tracks are not supported. Select a single one.',
    multipleLines: 'Multiple lines are not supported. Select a single one.',
    connectPrompt:
      "You don't have your Garmin account connected yet. Do you wish to do it now?",
    authPrompt:
      'You are not authenticated with Garmin yet. Do you wish to do it now?',
  },
};

export default en;
