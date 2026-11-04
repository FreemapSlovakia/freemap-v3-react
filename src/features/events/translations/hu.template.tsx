import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const hu: DeepPartialWithRequiredObjects<EventsMessages> = {
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Hiba az események betöltésekor', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Hiba az esemény mentésekor', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Hiba az esemény visszavonásakor', err),
  difficulty: {},
  form: {},
  filter: {},
  card: {},
  selection: {},
  picking: {},
  menu: {},
};

export default hu;
