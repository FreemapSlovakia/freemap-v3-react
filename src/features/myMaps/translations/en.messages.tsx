import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const en: MyMapsMessages = {
  addNew: 'Add new map',
  noMapFound: 'No map found',
  save: 'Save',
  loginToSave: 'Log in first to save the map to your maps.',
  reload: 'Reload map',
  reloadConfirm: 'Discard your unsaved changes and reload the saved map?',
  unsaved: 'Unsaved changes',
  unsavedTooltip:
    'The map has unsaved changes that are not reflected in the link. Save the map to keep them.',
  disconnect: 'Disconnect',
  disconnectAndClear: 'Disconnect and clear',
  deleteConfirm: (name) => (
    <>
      Do you really want to delete map <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Map deletion',
  mapCreated: ({ name }) => (
    <>
      Map <i>{name}</i> has been saved to your maps.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Changes to map <i>{name}</i> have been saved.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      Map <i>{name}</i> has been deleted from your maps.
    </>
  ),
  fetchError: ({ err }) => addError(getMessages()!, 'Error loading map', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading maps', err),
  deleteError: ({ err }) => addError(getMessages()!, 'Error deleting map', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving map', err),
  loadMergeModal: {
    title: 'Map is not empty',
    message:
      'The map already shows some content. Append the loaded map to it, or replace it?',
    append: 'Append',
    replace: 'Replace',
  },
  loadInclMapAndPosition: 'Include saved background map and position',
  writers: 'Editors',
  addWriter: 'Add an editor',
  conflictError: 'The map has been modified in the meantime.',
  availableOffline: 'Available offline',
  availableOfflineHint:
    'Keep a copy of this map in the browser so it can be opened without a connection. Background map tiles are cached separately via Offline maps.',
  offline: 'Offline',
  makeAllOffline: 'Make all available offline',
  removeAllOffline: 'Remove all from offline',
  offlineError: ({ err }) =>
    addError(getMessages()!, 'Error caching map offline', err),
  offlineCachedAll: ({ count }) => `${count} map(s) are now available offline.`,
  offlineCachedPartial: ({ count, failed }) =>
    `${count} map(s) cached offline, ${failed} failed.`,
  savedToOutbox: ({ name }) => (
    <>
      Map <i>{name}</i> has been saved in this browser and will be sent as soon
      as the connection allows.
    </>
  ),
  unsent: 'Unsent',
  unsentTooltip:
    'This map has changes saved in this browser that have not reached the server yet. They are sent automatically as soon as the connection allows.',
  syncing: 'Sending…',
  syncNow: 'Send unsent changes',
  outboxEmpty: 'There are no unsent changes.',
  outboxOffline: 'No connection — the unsent changes stay queued.',
  outboxSynced: ({ count }) => `Changes to ${count} map(s) have been sent.`,
  outboxRetryLater: ({ count }) =>
    `Changes to ${count} map(s) could not be sent and will be retried later.`,
  outboxError: ({ err }) =>
    addError(getMessages()!, 'Error sending unsent map changes', err),
  outboxConflict: ({ name }) => (
    <>
      Map <i>{name}</i> has been modified elsewhere since your unsent changes
      were made, so they can't be sent. Choose what to do with them.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      You no longer have permission to write to map <i>{name}</i>, so your
      unsent changes can't be sent. Choose what to do with them.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      Map <i>{name}</i> no longer exists, so your unsent changes can't be sent.
      Choose what to do with them.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      The unsent changes to map <i>{name}</i> can't be read back from this
      browser, so they can't be sent.
    </>
  ),
  outboxConflictBadge: 'Conflict',
  outboxBlockedBadge: 'Cannot send',
  outboxResolveCopy: 'Save as a copy',
  outboxResolveOverwrite: 'Overwrite the server version',
  outboxResolveDiscard: 'Discard my changes',
  outboxDiscardTitle: 'Discard unsent changes',
  outboxDiscardConfirm: (name) => (
    <>
      Discard the unsent changes to map <i>{name}</i>? They exist only in this
      browser and cannot be recovered.
    </>
  ),
  outboxCopyName: (name) => `${name} (copy)`,
  logoutUnsentTitle: 'Unsent map changes',
  logoutUnsentWarning: ({ count }) =>
    `${count} map(s) have changes that have not reached the server yet. Logging out discards them. Log out anyway?`,
};

export default en;
