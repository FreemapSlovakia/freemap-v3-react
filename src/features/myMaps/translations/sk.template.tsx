import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const sk: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  addNew: 'Pridať novú mapu',
  noMapFound: 'Žiadna mapa nenájdená',
  save: 'Uložiť',
  loginToSave: 'Pre uloženie mapy do vašich máp sa najprv prihláste.',
  reload: 'Znovu načítať mapu',
  reloadConfirm: 'Zahodiť neuložené zmeny a znovu načítať uloženú mapu?',
  unsaved: 'Neuložené zmeny',
  unsavedTooltip:
    'Mapa má neuložené zmeny, ktoré sa neodrážajú v odkaze. Uložte mapu, aby ste ich zachovali.',
  disconnect: 'Odpojiť',
  disconnectAndClear: 'Odpojiť a vyčistiť',
  deleteConfirm: (name) => (
    <>
      Naozaj si prajete vymazať mapu <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Vymazanie mapy',
  mapCreated: ({ name }) => (
    <>
      Mapa <i>{name}</i> bola uložená medzi vaše mapy.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Zmeny v mape <i>{name}</i> boli uložené.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      Mapa <i>{name}</i> bola vymazaná z vašich máp.
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní mapy', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri načítavaní máp', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri mazaní mapy', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri ukladaní mapy', err),
  loadToEmpty: 'Do čistej mapy',
  loadInclMapAndPosition: 'Vrátane uloženej podkladovej mapy a pozície',
  writers: 'Editori',
  addWriter: 'Pridať editora',
  conflictError: 'Mapa bola medzičasom modifikovaná.',
  availableOffline: 'Dostupné offline',
  availableOfflineHint:
    'Uchová kópiu tejto mapy v prehliadači, aby sa dala otvoriť aj bez pripojenia. Dlaždice podkladovej mapy sa ukladajú samostatne cez Offline mapy.',
  offline: 'Offline',
  makeAllOffline: 'Sprístupniť všetky offline',
  removeAllOffline: 'Odstrániť všetky z offline',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri ukladaní mapy pre offline', err),
  offlineCachedAll: ({ count }) => `Počet máp dostupných offline: ${count}.`,
  offlineCachedPartial: ({ count, failed }) =>
    `Offline uložených máp: ${count}, neúspešných: ${failed}.`,
  savedToOutbox: ({ name }) => (
    <>
      Mapa <i>{name}</i> bola uložená v tomto prehliadači a odošle sa hneď, ako
      to pripojenie dovolí.
    </>
  ),
  unsent: 'Neodoslané',
  unsentTooltip:
    'Táto mapa má zmeny uložené v tomto prehliadači, ktoré sa ešte nedostali na server. Odošlú sa automaticky, hneď ako to pripojenie dovolí.',
  syncing: 'Odosielam…',
  syncNow: 'Odoslať neodoslané zmeny',
  outboxEmpty: 'Žiadne neodoslané zmeny.',
  outboxOffline: 'Bez pripojenia — neodoslané zmeny zostávajú v poradí.',
  outboxSynced: ({ count }) => `Odoslané zmeny v mapách: ${count}.`,
  outboxRetryLater: ({ count }) =>
    `Zmeny v mapách sa nepodarilo odoslať (${count}); skúsi sa to znovu neskôr.`,
  outboxError: ({ err }) =>
    addError(getMessages()!, 'Chyba pri odosielaní zmien máp', err),
  outboxConflict: ({ name }) => (
    <>
      Mapa <i>{name}</i> bola medzičasom zmenená inde, takže vaše neodoslané
      zmeny nemožno odoslať. Vyberte, čo s nimi.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Už nemáte právo zapisovať do mapy <i>{name}</i>, takže vaše neodoslané
      zmeny nemožno odoslať. Vyberte, čo s nimi.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      Mapa <i>{name}</i> už neexistuje, takže vaše neodoslané zmeny nemožno
      odoslať. Vyberte, čo s nimi.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      Neodoslané zmeny mapy <i>{name}</i> sa nedajú načítať z tohto prehliadača,
      takže ich nemožno odoslať.
    </>
  ),
  outboxConflictBadge: 'Konflikt',
  outboxBlockedBadge: 'Nedá sa odoslať',
  outboxResolveCopy: 'Uložiť ako kópiu',
  outboxResolveOverwrite: 'Prepísať verziu na serveri',
  outboxResolveDiscard: 'Zahodiť moje zmeny',
  outboxDiscardTitle: 'Zahodenie neodoslaných zmien',
  outboxDiscardConfirm: (name) => (
    <>
      Zahodiť neodoslané zmeny mapy <i>{name}</i>? Existujú len v tomto
      prehliadači a nedajú sa obnoviť.
    </>
  ),
  outboxCopyName: (name) => `${name} (kópia)`,
  logoutUnsentTitle: 'Neodoslané zmeny máp',
  logoutUnsentWarning: ({ count }) =>
    `Počet máp so zmenami, ktoré sa ešte nedostali na server: ${count}. Odhlásením sa zahodia. Napriek tomu sa odhlásiť?`,
};

export default sk;
