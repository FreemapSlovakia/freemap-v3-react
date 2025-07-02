import { authSetUser } from '../actions/authActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
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
