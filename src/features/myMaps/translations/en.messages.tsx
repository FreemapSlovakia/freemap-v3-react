import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { MyMapsMessages } from './MyMapsMessages.js';

const en: MyMapsMessages = {
  addNew: 'Add new map',
  noMapFound: 'No map found',
  save: 'Save',
  disconnect: 'Disconnect',
  disconnectAndClear: 'Disconnect and clear',
  deleteConfirm: (name) => (
    <>
      Do you really want to delete map <i>{name}</i>?
    </>
  ),
  deleteTitle: 'Map deletion',
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
