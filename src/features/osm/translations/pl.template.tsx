import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { OsmMessages } from './OsmMessages.js';

const pl: DeepPartialWithRequiredObjects<OsmMessages> = {
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania danych OSM', err),
};

export default pl;
