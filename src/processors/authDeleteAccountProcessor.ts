import { authDeleteAccount, authLogout } from '../actions/authActions.js';
import { gallerySetLayerDirty } from '../actions/galleryActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const authDeleteAccountProcessor: Processor<typeof authDeleteAccount> = {
  actionCreator: authDeleteAccount,
  errorKey: 'general.deleteError',
  async handle({ getState, dispatch }) {
    await httpRequest({
      getState,
      method: 'DELETE',
      url: '/auth/settings',
      expectedStatus: 204,
    });

    dispatch(authLogout());

    dispatch(gallerySetLayerDirty());

    dispatch(
      toastsAdd({
        id: 'account.deleted',
        messageKey: 'general.deleted', // TODO use non-generic message
        style: 'info',
        timeout: 5000,
      }),
    );
  },
};
