import { assert } from 'typia';
import { toastsAdd } from '../../../toasts/model/actions.js';
import { trackingActions } from '../actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';
import type { StringDates } from '../../../../types/common.js';
import type { AccessToken } from '../types.js';

export const saveAccessTokenProcessor: Processor<
  typeof trackingActions.saveAccessToken
> = {
  actionCreator: trackingActions.saveAccessToken,
  errorKey: 'general.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { modifiedAccessTokenId } = getState().tracking;

    window._paq.push([
      'trackEvent',
      'Tracking',
      'saveAccessToken',
      modifiedAccessTokenId ? 'modify' : 'create',
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
        assert<StringDates<AccessToken[]>>(await res.json()).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          timeFrom: item.timeFrom === null ? null : new Date(item.timeFrom),
          timeTo: item.timeTo === null ? null : new Date(item.timeTo),
        })),
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
