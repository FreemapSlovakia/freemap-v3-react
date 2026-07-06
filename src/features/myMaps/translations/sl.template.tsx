import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const sl: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Dodaj nov zemljevid',
  noMapFound: 'Ni najdenega zemljevida',
  save: 'Shrani',
  disconnect: 'Odklopi',
  disconnectAndClear: 'Odklopi in počisti',
  deleteConfirm: (name) => (
    <>
      Ali res želite izbrisati zemljevid <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Brisanje zemljevida',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju zemljevida', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju zemljevidov', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri brisanju zemljevida', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju zemljevida', err),
  loadToEmpty: 'V prazen zemljevid',
  loadInclMapAndPosition: 'Vključno s shranjenim podložnim zemljevidom in lego',
  writers: 'Uredniki',
  addWriter: 'Dodaj urednika',
  conflictError: 'Zemljevid je bil vmes spremenjen.',
  availableOffline: 'Na voljo brez povezave',
  availableOfflineHint:
    'Ohrani kopijo tega zemljevida v brskalniku, da ga je mogoče odpreti tudi brez povezave. Ploščice podložnega zemljevida se shranjujejo ločeno prek Zemljevidov brez povezave.',
  offline: 'Brez povezave',
  makeAllOffline: 'Vse omogoči brez povezave',
  removeAllOffline: 'Vse odstrani iz načina brez povezave',
  offlineError: ({ err }) =>
    addError(
      getMessages()!,
      'Napaka pri shranjevanju zemljevida za uporabo brez povezave',
      err,
    ),
  offlineCachedAll: ({ count }) =>
    `Število zemljevidov, ki so zdaj na voljo brez povezave: ${count}.`,
  offlineCachedPartial: ({ count, failed }) =>
    `Brez povezave shranjenih zemljevidov: ${count}, neuspešnih: ${failed}.`,
};

export default sl;
