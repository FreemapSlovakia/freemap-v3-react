import type { MyStore, RootState } from '@app/store/store.js';
import { getMessageByKey } from '@features/l10n/l10nInjector.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import type { ResolvedToast } from '@features/toasts/model/actions.js';

/** What a failed processor says, resolved where the global bundle holds it. */
function toastText(toast: ResolvedToast): string {
  const message = getMessageByKey(getMessages(), toast.messageKey);

  if (typeof message === 'string') {
    return message;
  }

  if (typeof message === 'function') {
    const resolved: unknown = message(toast.messageParams);

    if (typeof resolved === 'string') {
      return resolved;
    }
  }

  return toast.messageKey;
}

/**
 * Resolves with the first truthy value `select` reads off the store — how a
 * tool awaits the processor that answers its dispatch.
 *
 * A processor that fails answers with a `danger` toast and no state change, so
 * one raised while waiting is reported as the tool's error instead of being
 * left to time out. Any danger toast counts, including one another feature
 * happened to raise meanwhile.
 */
export function waitForState<T>(
  store: MyStore,
  select: (state: RootState) => T | false | null | undefined,
  { signal, timeoutMs = 30_000 }: { signal?: AbortSignal; timeoutMs?: number },
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const initial = select(store.getState());

    if (initial) {
      resolve(initial);

      return;
    }

    if (signal?.aborted) {
      reject(new DOMException('aborted', 'AbortError'));

      return;
    }

    // The toasts themselves, not their keys: an error toast carries a stable id
    // (`objects`, `routePlanner`), so a second failure of the same processor
    // reuses the key and would otherwise read as the toast already seen.
    const knownToasts = new Set(Object.values(store.getState().toasts.toasts));

    const finish = () => {
      unsubscribe();

      window.clearTimeout(timer);

      signal?.removeEventListener('abort', abort);
    };

    const abort = () => {
      finish();

      reject(new DOMException('aborted', 'AbortError'));
    };

    const unsubscribe = store.subscribe(() => {
      const state = store.getState();

      const value = select(state);

      if (value) {
        finish();

        resolve(value);

        return;
      }

      for (const toast of Object.values(state.toasts.toasts)) {
        if (toast.style === 'danger' && !knownToasts.has(toast)) {
          finish();

          reject(new Error(toastText(toast)));

          return;
        }
      }
    });

    const timer = window.setTimeout(() => {
      finish();

      reject(new Error('The application did not answer in time.'));
    }, timeoutMs);

    signal?.addEventListener('abort', abort);
  });
}
