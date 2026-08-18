import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const sl: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Dodaj nov zemljevid',
  noMapFound: 'Ni najdenega zemljevida',
  save: 'Shrani',
  loginToSave: 'Za shranjevanje zemljevida med svoje se najprej prijavite.',
  reload: 'Ponovno naloži zemljevid',
  reloadConfirm:
    'Zavržem neshranjene spremembe in ponovno naložim shranjeni zemljevid?',
  unsaved: 'Neshranjene spremembe',
  unsavedTooltip:
    'Zemljevid ima neshranjene spremembe, ki se ne odražajo v povezavi. Shranite zemljevid, da jih ohranite.',
  disconnect: 'Odklopi',
  disconnectAndClear: 'Odklopi in počisti',
  deleteConfirm: (name) => (
    <>
      Ali res želite izbrisati zemljevid <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Brisanje zemljevida',
  mapCreated: ({ name }) => (
    <>
      Zemljevid <i>{name}</i> je bil shranjen med vaše zemljevide.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Spremembe zemljevida <i>{name}</i> so bile shranjene.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      Zemljevid <i>{name}</i> je bil izbrisan iz vaših zemljevidov.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju zemljevida', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri nalaganju zemljevidov', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri brisanju zemljevida', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri shranjevanju zemljevida', err),
  loadMergeModal: {
    title: 'Zemljevid ni prazen',
    message:
      'Na zemljevidu je že prikazana vsebina. Ali naloženi zemljevid pripnete k njej ali vsebino nadomestite?',
    append: 'Pripni',
    replace: 'Nadomesti',
  },
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
  savedToOutbox: ({ name }) => (
    <>
      Zemljevid <i>{name}</i> je bil shranjen v tem brskalniku in bo poslan
      takoj, ko bo povezava to dopuščala.
    </>
  ),
  unsent: 'Neposlano',
  unsentTooltip:
    'Ta zemljevid ima spremembe, shranjene v tem brskalniku, ki še niso prišle na strežnik. Poslane bodo samodejno, takoj ko bo povezava to dopuščala.',
  syncing: 'Pošiljanje…',
  syncNow: 'Pošlji neposlane spremembe',
  outboxEmpty: 'Ni neposlanih sprememb.',
  outboxOffline: 'Ni povezave — neposlane spremembe ostajajo v vrsti.',
  outboxSynced: ({ count }) => `Poslane spremembe zemljevidov: ${count}.`,
  outboxRetryLater: ({ count }) =>
    `Sprememb zemljevidov ni bilo mogoče poslati (${count}); poskus bo ponovljen pozneje.`,
  outboxError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pošiljanju sprememb zemljevidov', err),
  outboxConflict: ({ name }) => (
    <>
      Zemljevid <i>{name}</i> je bil medtem spremenjen drugje, zato vaših
      neposlanih sprememb ni mogoče poslati. Izberite, kaj z njimi.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Nimate več pravice pisanja v zemljevid <i>{name}</i>, zato vaših
      neposlanih sprememb ni mogoče poslati. Izberite, kaj z njimi.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      Zemljevid <i>{name}</i> ne obstaja več, zato vaših neposlanih sprememb ni
      mogoče poslati. Izberite, kaj z njimi.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      Neposlanih sprememb zemljevida <i>{name}</i> ni mogoče prebrati iz tega
      brskalnika, zato jih ni mogoče poslati.
    </>
  ),
  outboxConflictBadge: 'Spor',
  outboxBlockedBadge: 'Ni mogoče poslati',
  outboxResolveCopy: 'Shrani kot kopijo',
  outboxResolveOverwrite: 'Prepiši različico na strežniku',
  outboxResolveDiscard: 'Zavrzi moje spremembe',
  outboxDiscardTitle: 'Zavrženje neposlanih sprememb',
  outboxDiscardConfirm: (name) => (
    <>
      Zavreči neposlane spremembe zemljevida <i>{name}</i>? Obstajajo le v tem
      brskalniku in jih ni mogoče obnoviti.
    </>
  ),
  outboxCopyName: (name) => `${name} (kopija)`,
  logoutUnsentTitle: 'Neposlane spremembe zemljevidov',
  logoutUnsentWarning: ({ count }) =>
    `Število zemljevidov s spremembami, ki še niso prišle na strežnik: ${count}. Z odjavo bodo zavržene. Se vseeno odjavite?`,
};

export default sl;
