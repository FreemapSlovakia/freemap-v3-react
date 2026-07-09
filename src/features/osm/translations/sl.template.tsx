import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { OsmMessages } from './OsmMessages.js';

const sl: DeepPartialWithRequiredObjects<OsmMessages> = {
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju podatkov OSM', err),
};

export default sl;
