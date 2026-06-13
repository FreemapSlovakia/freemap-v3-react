import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { OsmMessages } from './OsmMessages.js';

const de: DeepPartialWithRequiredObjects<OsmMessages> = {
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Abrufen von OSM-Daten', err),
};

export default de;
