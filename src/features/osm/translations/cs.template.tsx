import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { OsmMessages } from './OsmMessages.js';

const cs: DeepPartialWithRequiredObjects<OsmMessages> = {
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání OSM dat', err),
};

export default cs;
