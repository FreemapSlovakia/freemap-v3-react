import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const en: ObjectsMessages = {
  type: 'Type',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `To see objects by their type, you need to zoom in to at least level ${minZoom}.`,
    zoom: 'Zoom-in',
  },
  tooManyPoints: ({ limit }) => `Result was limited to ${limit} objects.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching objects (POIs)', err),
  icon: {
    pin: 'Pin',
    ring: 'Ring',
    square: 'Square',
  },
  convertAsPoint: 'As point',
  convertWithGeometry: 'With full geometry',
  showAsLookup: 'Show as Lookup',
  convertAll: 'Convert all visible objects to drawing',
};

export default en;
