import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const en: ObjectsMessages = {
  source: 'Source',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Open at OpenStreetMap.org"
      historyText="history"
      editInJosmText="Edit in JOSM"
    />
  ),
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
  convertAsPoint: 'As point',
  convertWithGeometry: 'With full geometry',
  showAsLookup: 'Show as Lookup',
  convertAll: 'Convert all visible objects to drawing',
  style: {
    button: 'Marker style',
    title: 'Object marker style',
  },
};

export default en;
