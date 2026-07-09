import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { galleryAllOfLicense, gallerySetLayerDirty } from '../actions.js';

export const galleryAllOfLicenseProcessor: Processor<
  typeof galleryAllOfLicense
> = {
  actionCreator: galleryAllOfLicense,
  async handle({ getState, action, dispatch }) {
    await httpRequest({
      getState,
      method: 'POST',
      url: `/gallery/pictures`,
      data: {
        action: 'setAllLicense',
        payload: action.payload,
      },
      expectedStatus: 204,
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );

    dispatch(gallerySetLayerDirty());
  },
};
