import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { EventsMessages } from './EventsMessages.js';

const sk: DeepPartialWithRequiredObjects<EventsMessages> = {
  title: 'Akcie',
  createNew: 'Vytvoriť novú akciu',
  noEvents: 'Nenašli sa žiadne akcie',
  filterFrom: 'Od',
  filterTo: 'Do',
  inMapArea: 'Len v aktuálnom výreze mapy',
  activityType: 'Typ aktivity',
  activityTypePlaceholder: 'Ľubovoľný (pripravuje sa)',
  formTitle: 'Názov',
  formDescription: 'Popis',
  startAt: 'Začiatok',
  endAt: 'Koniec',
  startPoint: 'Miesto stretnutia',
  takeFromRouteStart: 'Prevziať zo začiatku trasy',
  visibility: 'Viditeľnosť',
  visibilityPublic: 'Verejná',
  visibilityUnlisted: 'Skrytá (prístupná cez odkaz)',
  source: 'Mapa',
  sourceExisting: 'Existujúca uložená mapa',
  sourceCurrent: 'Publikovať aktuálnu mapu',
  sourceCurrentName: 'Názov novej mapy',
  pickMap: 'Vyberte mapu…',
  noWritableMaps: 'Zatiaľ nemáte žiadne uložené mapy.',
  edit: 'Upraviť',
  delete: 'Vymazať',
  open: 'Otvoriť',
  deleteConfirm: (title) => `Naozaj chcete vymazať akciu „${title}“?`,
  publishAsEvent: 'Publikovať ako akciu',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri načítavaní akcií', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní akcie', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri mazaní akcie', err),
};

export default sk;
