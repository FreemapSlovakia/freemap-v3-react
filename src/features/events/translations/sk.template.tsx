import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventDetails } from '../components/EventDetails.js';
import type { EventsMessages } from './EventsMessages.js';

const sk: DeepPartialWithRequiredObjects<EventsMessages> = {
  noEvents: 'Nenašli sa žiadne akcie',
  event: 'Akcia',
  eventHint:
    'Zverejní mapu ako akciu, ktorú ostatní nájdu vo vrstve Akcie a otvoria cez odkaz, aj keď mapa nie je verejná.',
  formDescription: 'Popis',
  startAt: 'Začiatok',
  endAt: 'Koniec',
  startPoint: 'Miesto stretnutia',
  takeFromRouteStart: 'Prevziať zo začiatku trasy',
  pickOnMap: 'Vybrať na mape',
  pickStartPrompt: 'Kliknite do mapy na miesto, kde akcia začína',
  visibility: 'Viditeľnosť',
  visibilityPublic: 'Verejná',
  visibilityUnlisted: 'Skrytá (prístupná cez odkaz)',
  open: 'Otvoriť',
  backToEvents: 'Späť na akcie',
  details: ({ event }) => <EventDetails event={event} />,
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri načítavaní akcií', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní akcie', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri rušení akcie', err),
};

export default sk;
