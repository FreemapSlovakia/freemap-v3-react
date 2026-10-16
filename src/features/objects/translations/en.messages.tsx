import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const en: ObjectsMessages = {
  source: 'Source',
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Elevation',
  terrain: {
    prominence: 'Prominence',
    keyCol: 'Key col',
    isolation: 'Isolation',
    showRoute: 'Show route to higher ground',
    hideRoute: 'Hide route',
    depth: 'Saddle depth',
    keyColOf: 'Key col of',
    showOnMap: 'Show on map',
    route: 'Route to higher ground',
    summitElevation: 'Summit elevation',
    saddleElevation: 'Saddle elevation',
    fromMarker: ({ distance }) => `${distance} from the marker`,
  },
  routeFetchError: ({ err }) =>
    addError(getMessages()!, 'Error fetching the route', err),
  showDetails: 'Details',
  moreGeneralTypes: 'More general types',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (history)',
  history: 'History',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `To see objects by their type, you need to zoom in to at least level ${minZoom}.`,
    zoom: 'Zoom-in',
  },
  tooManyPoints: ({ limit }) => `Result was limited to ${limit} objects.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching objects (POIs)', err),
  markerShape: 'Marker shape',
  icon: {
    pin: 'Pin',
    ring: 'Ring',
    square: 'Square',
  },
  tooManyForLookup: ({ count, limit }) =>
    `Too many objects to show as lookups (${count}, at most ${limit}). Zoom in or narrow the filter.`,
  showAsLookup: 'Show as Lookup',
  showAllAsLookup: 'Show all as Lookup',
  style: {
    button: 'Marker style',
    title: 'Object marker style',
  },
};

export default en;
