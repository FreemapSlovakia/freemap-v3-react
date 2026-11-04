import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const sk: DeepPartialWithRequiredObjects<EventsMessages> = {
  noEvents: 'Nenašli sa žiadne akcie',
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri načítavaní akcií', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní akcie', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Akcia je uložená, ale jej titulný obrázok nie',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Chyba pri ukladaní novej mapy, akcia preto nie je uložená',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri rušení akcie', err),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní vašej účasti', err),
  loginToParticipate:
    'Ak chcete dať vedieť, že máte záujem alebo prídete, prihláste sa.',
};

export default sk;
