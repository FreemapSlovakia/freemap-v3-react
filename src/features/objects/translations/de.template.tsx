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
  terrain: {
    prominence: 'Schartenhöhe',
    keyCol: 'Scharte',
    isolation: 'Dominanz',
    showRoute: 'Weg zu höherem Gelände zeigen',
    hideRoute: 'Weg ausblenden',
    depth: 'Satteltiefe',
    keyColOf: 'Scharte von',
    showOnMap: 'Auf der Karte zeigen',
    route: 'Weg zu höherem Gelände',
    summitElevation: 'Gipfelhöhe',
    saddleElevation: 'Sattelhöhe',
    fromMarker: ({ distance }) => `${distance} von der Markierung`,
  },
  routeFetchError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Abrufen des Weges', err),
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
  tooManyForLookup: ({ count, limit }) =>
    `Zu viele Objekte, um sie als Funde anzuzeigen (${count}, höchstens ${limit}). Zoomen Sie hinein oder schränken Sie den Filter ein.`,
  showAsLookup: 'Als Fund anzeigen',
  showDetails: 'Details',
  moreGeneralTypes: 'Allgemeinere Typen',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (Verlauf)',
  tooManyPoints: ({ limit }) =>
    `Das Ergebnis wurde auf ${limit} Objekte begrenzt.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Objekte (POIs)', err),
  markerShape: 'Markerform',
  showAllAsLookup: 'Alle als Funde anzeigen',
};

export default de;
