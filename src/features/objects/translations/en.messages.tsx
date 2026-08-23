import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const en: ObjectsMessages = {
  source: 'Source',
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Elevation',
  showDetails: 'Details',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (history)',
  type: 'Type',
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
  convertWithGeometry: 'With full geometry',
  convertWithGeometryTo: ({ tool }) => <>With full geometry to {tool}</>,
  tooManyForLookup: ({ count, limit }) =>
    `Too many objects to show as lookups (${count}, at most ${limit}). Zoom in or narrow the filter.`,
  showAsLookup: 'Show as Lookup',
  style: {
    button: 'Marker style',
    title: 'Object marker style',
  },
};

export default en;
