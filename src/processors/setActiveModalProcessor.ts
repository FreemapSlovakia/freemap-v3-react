import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';

export const setActiveModalTransformer: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    const anonymous = !getState().auth.user;

    return action.payload &&
      [
        'maps',
        'gallery-upload',
        'account',
        'tracking-my',
        'download-map',
      ].includes(action.payload) &&
      anonymous
      ? toastsAdd({
          messageKey: 'general.unauthenticatedError',
          style: 'danger',
          cancelType: authSetUser.type,
        })
      : action;
  },
};
