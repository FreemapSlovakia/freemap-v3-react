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
  loadToEmpty: 'To empty map',
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
};

export default en;
