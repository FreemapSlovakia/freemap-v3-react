import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';

export const setActiveModalTransformer: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    const anonymous = !getState().auth.user;

    const type = action.payload?.type;

    const blocked =
      type &&
      [
        'my-maps',
        'gallery-upload',
        'account',
        'tracking-my',
        'offline-map-export',
      ].includes(type) &&
      anonymous;

    if (blocked) {
      return toastsAdd({
        messageKey: 'general.unauthenticatedError',
        style: 'danger',
        cancelType: authSetUser.type,
      });
    }

    // track every modal that actually opens (payload null closes a modal)
    if (type) {
      window._paq.push(['trackEvent', 'Modal', 'open', type]);
    }

    return action;
  },
};
