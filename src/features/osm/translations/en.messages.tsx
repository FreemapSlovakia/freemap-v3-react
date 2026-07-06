import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { OsmMessages } from './OsmMessages.js';

const en: OsmMessages = {
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching OSM data', err),
};

export default en;
