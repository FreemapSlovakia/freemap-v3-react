import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import z from 'zod';
import { trackingActions } from '../actions.js';
import { AccessTokenSchema } from '../types.js';

export const saveAccessTokenProcessor: Processor<
  typeof trackingActions.saveAccessToken
> = {
  actionCreator: trackingActions.saveAccessToken,
  errorKey: 'general.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { modifiedAccessTokenId } = getState().tracking;

    trackMatomo([
      'trackEvent',
      'Tracking',
      modifiedAccessTokenId ? 'update' : 'create',
      'accessToken',
    ]);

    if (modifiedAccessTokenId) {
      await httpRequest({
        getState,
        method: 'PUT',
        url: `/tracking/access-tokens/${modifiedAccessTokenId}`,
        data: action.payload,
      });

      dispatch(trackingActions.modifyAccessToken(undefined));
    } else {
      await httpRequest({
        getState,
        method: 'POST',
        url: `/tracking/devices/${
          getState().tracking.accessTokensDeviceId
        }/access-tokens`,
        data: action.payload,
      });

      dispatch(trackingActions.modifyAccessToken(undefined));
    }

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );
  },
};

export const loadAccessTokensProcessor: Processor<
  typeof trackingActions.loadAccessTokens
> = {
  actionCreator: trackingActions.loadAccessTokens,
  errorKey: 'general.loadError',
  handle: async ({ dispatch, getState }) => {
    const res = await httpRequest({
      getState,
      url: `/tracking/devices/${
        getState().tracking.accessTokensDeviceId
      }/access-tokens`,
    });

    dispatch(
      trackingActions.setAccessTokens(
        z.array(AccessTokenSchema).parse(await res.json()),
      ),
    );
  },
};

export const deleteAccessTokenProcessor: Processor<
  typeof trackingActions.deleteAccessToken
> = {
  actionCreator: trackingActions.deleteAccessToken,
  errorKey: 'general.deleteError',
  handle: async ({ dispatch, getState, action }) => {
    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/tracking/access-tokens/${encodeURIComponent(action.payload)}`,
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.deleted',
      }),
    );

    dispatch(trackingActions.loadAccessTokens());
  },
};
