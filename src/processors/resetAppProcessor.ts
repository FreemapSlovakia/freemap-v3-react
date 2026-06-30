import { resetApp } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { suspendStatePersistence } from '@app/store/middleware/statePersistingMiddleware.js';
import { STORAGE_KEY } from '@app/store/persistence.js';
import storage from 'local-storage-fallback';

export const resetAppProcessor: Processor<typeof resetApp> = {
  actionCreator: resetApp,
  handle() {
    // Stop persisting first, so an action dispatched before the page unloads
    // can't re-write the store we're about to drop.
    suspendStatePersistence();

    // Drop the persisted Redux store; the app re-bootstraps from defaults on
    // reload.
    storage.removeItem(STORAGE_KEY);

    window.location.reload();
  },
};
