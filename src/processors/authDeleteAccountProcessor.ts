import { authDeleteAccount, authLogout } from 'fm3/actions/authActions';
import { gallerySetLayerDirty } from 'fm3/actions/galleryActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
