import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { httpRequest } from 'fm3/authAxios';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';

export const saveAccessTokenProcessor: IProcessor<
  typeof trackingActions.saveAccessToken
> = {
  actionCreator: trackingActions.saveAccessToken,
  handle: async ({ dispatch, getState, action }) => {
    const { modifiedAccessTokenId } = getState().tracking;

    try {
      if (modifiedAccessTokenId) {
        await httpRequest({
          getState,
          dispatch,
          method: 'PUT',
          url: `/tracking/access-tokens/${modifiedAccessTokenId}`,
          body: action.payload,
        });
        dispatch(trackingActions.modifyAccessToken(undefined));
      } else {
        await httpRequest({
          getState,
          dispatch,
          method: 'POST',
          url: `/tracking/devices/${
            getState().tracking.accessTokensDeviceId
          }/access-tokens`,
          body: action.payload,
        });
        dispatch(trackingActions.modifyAccessToken(undefined));
      }
    } catch (err) {
      dispatch(toastsAddError('tracking.loadError', err)); // TODO
    }
  },
};

export const loadAccessTokensProcessor: IProcessor<
  typeof trackingActions.loadAccessTokens
> = {
  actionCreator: trackingActions.loadAccessTokens,
  handle: async ({ dispatch, getState }) => {
    try {
      const { data } = await httpRequest({
        getState,
        dispatch,
        method: 'GET',
        url: `/tracking/devices/${
          getState().tracking.accessTokensDeviceId
        }/access-tokens`,
      });

      for (const accessToken of data) {
        for (const field of ['createdAt', 'timeFrom', 'timeTo']) {
          accessToken[field] =
            accessToken[field] && new Date(accessToken[field]);
        }
      }

      dispatch(trackingActions.setAccessTokens(data));
    } catch (err) {
      dispatch(toastsAddError('tracking.loadError', err)); // TODO
    }
  },
};

export const deleteAccessTokenProcessor: IProcessor<
  typeof trackingActions.deleteAccessToken
> = {
  actionCreator: trackingActions.deleteAccessToken,
  handle: async ({ dispatch, getState, action }) => {
    try {
      await httpRequest({
        getState,
        dispatch,
        method: 'GET',
        url: `/tracking/access-tokens/${encodeURIComponent(action.payload)}`,
      });

      dispatch(trackingActions.loadAccessTokens());
    } catch (err) {
      dispatch(toastsAddError('tracking.deleteError', err)); // TODO
    }
  },
};
