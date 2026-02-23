import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { httpRequest } from '@app/httpRequest.js';
import { galleryAllPremiumOrFree, gallerySetLayerDirty } from '../actions.js';

export const galleryMakeAllPremiumOrFreeProcessor: Processor<
  typeof galleryAllPremiumOrFree
> = {
  actionCreator: galleryAllPremiumOrFree,
  async handle({ getState, action, dispatch }) {
    await new Promise((resolve) => window.setTimeout(resolve));

    if (
      !window.confirm(
        window.translations?.general.areYouSure ?? 'Are you sure?',
      )
    ) {
      return;
    }

    await httpRequest({
      getState,
      method: 'POST',
      url: `/gallery/pictures`,
      data: {
        action: 'setAllPremiumOrFree',
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
