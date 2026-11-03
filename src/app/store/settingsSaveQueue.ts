import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from './store.js';

let queue: Promise<unknown> = Promise.resolve();

/**
 * Runs account-settings saves one after another. Each save replaces the keys it
 * sends, so two in flight could land in the wrong order and the older win.
 */
export function queueSettingsSave<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);

  queue = run.catch(() => undefined);

  return run;
}

/**
 * Sends the account settings. Never cancelled: queued, a request can't be
 * overtaken, and aborting one would only drop a change the server may have.
 */
export function patchAccountSettings(
  getState: () => RootState,
  data: Record<string, unknown>,
): Promise<unknown> {
  return httpRequest({
    getState,
    method: 'PATCH',
    url: '/auth/settings',
    expectedStatus: 204,
    cancelActions: [],
    data,
  });
}
