import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { gallerySetLayerDirty } from '@features/gallery/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { httpRequest } from '@app/httpRequest.js';
import { authDeleteAccount, authLogout } from '../actions.js';

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
