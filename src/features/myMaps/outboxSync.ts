import type { MyStore } from '@app/store/store.js';
import { mapsSyncOutbox } from './model/actions.js';

/**
 * Pushes queued saves as soon as the connection returns. The app-start replay
 * needs no listener: the outbox processor also runs on the session check, which
 * is what a validated session arrives as.
 */
export function attachOutboxSync(store: MyStore): void {
  window.addEventListener('online', () => {
    store.dispatch(mapsSyncOutbox());
  });
}
