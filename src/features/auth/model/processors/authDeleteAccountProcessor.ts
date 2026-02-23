import { authDeleteAccount, authLogout } from '../actions.js';
import { gallerySetLayerDirty } from '../../../gallery/model/actions.js';
import { toastsAdd } from '../../../toasts/model/actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';

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
