import type { MyStore } from '@app/store/store.js';
import { authSetUser } from './model/actions.js';
import type { User } from './model/types.js';

// Broadcasts this tab's user to the others, keyed on the session and the email
// fields: unrelated changes don't cross tabs, and a received user doesn't
// echo back.
export function attachAuthSync(store: MyStore): void {
  let bc: BroadcastChannel;

  try {
    bc = new BroadcastChannel('freemap-auth');
  } catch (err) {
    // BroadcastChannel is missing or blocked (unsupported browser / insecure
    // context). Cross-tab session sync just won't happen there; skip it instead
    // of throwing and aborting the rest of app startup.
    console.warn('Cross-tab auth sync unavailable:', err);

    return;
  }

  const keyOf = (user: User | null) =>
    user
      ? `${user.id}:${user.authToken}:${user.email}:${user.emailVerified}:${user.emailReminderOff}`
      : '';

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
