import { authSetUser } from '../features/auth/model/actions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../features/toasts/model/actions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
