import type { MyStore } from '@app/store/store.js';
import { authSetUser } from './model/actions.js';
import type { User } from './model/types.js';

// Propagate login/logout across tabs. When this tab's user changes we broadcast
// it; other tabs apply it via `authSetUser`. Keyed on id + authToken so only
// real session changes cross tabs (not unrelated actions), and so applying a
// received user doesn't echo back.
export function attachAuthSync(store: MyStore): void {
  const bc = new BroadcastChannel('freemap-auth');

  const keyOf = (user: User | null) =>
    user ? `${user.id}:${user.authToken}` : '';

  let lastKey = keyOf(store.getState().auth.user);

  bc.onmessage = (e) => {
    const user = e.data as User | null;

    lastKey = keyOf(user); // set before dispatch so our subscriber won't rebroadcast

    store.dispatch(authSetUser(user));
  };

  store.subscribe(() => {
    const user = store.getState().auth.user;

    const key = keyOf(user);

    if (key !== lastKey) {
      lastKey = key;

      bc.postMessage(user);
    }
  });
}
