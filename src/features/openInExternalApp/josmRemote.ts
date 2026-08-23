import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from 'redux';

/**
 * A JOSM remote-control call. Fire-and-forget: what can go wrong — JOSM not
 * running, remote control switched off — is answered in a toast, since nothing
 * here can act on it.
 */
export function josmRemote(
  dispatch: Dispatch,
  command: string,
  params: Record<string, string>,
): void {
  const url = new URL(command, 'http://localhost:8111/');

  url.search = new URLSearchParams(params).toString();

  fetch(url.toString())
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error response from localhost:8111: ${res.status}`);
      }
    })
    .catch((err) => {
      dispatch(
        toastsAdd({
          messageKey: 'general.operationError',
          messageParams: { err },
          style: 'danger',
        }),
      );
    });
}
