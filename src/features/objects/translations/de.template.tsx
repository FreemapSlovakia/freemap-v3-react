import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const de: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  style: {
    button: 'Markierungsstil',
    title: 'Markierungsstil der Objekte',
  },
  source: 'Quelle',
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Höhe',
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
  convertWithGeometry: 'Mit voller Geometrie',
  convertWithGeometryTo: ({ tool }) => <>Mit voller Geometrie nach {tool}</>,
  tooManyForLookup: ({ count, limit }) =>
    `Zu viele Objekte, um sie als Funde anzuzeigen (${count}, höchstens ${limit}). Zoomen Sie hinein oder schränken Sie den Filter ein.`,
  showAsLookup: 'Als Fund anzeigen',
  showDetails: 'Details',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (Verlauf)',
  type: 'Typ',
  tooManyPoints: ({ limit }) =>
    `Das Ergebnis wurde auf ${limit} Objekte begrenzt.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Objekte (POIs)', err),
  markerShape: 'Markerform',
};

export default de;
