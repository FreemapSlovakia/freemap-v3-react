import { trackingActions } from 'fm3/actions/trackingActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const saveAccessTokenProcessor: Processor<
  typeof trackingActions.saveAccessToken
> = {
  actionCreator: trackingActions.saveAccessToken,
  errorKey: 'tracking.loadError', // TODO
  handle: async ({ dispatch, getState, action }) => {
    const { modifiedAccessTokenId } = getState().tracking;

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
  },
};

export const loadAccessTokensProcessor: Processor<
  typeof trackingActions.loadAccessTokens
> = {
  actionCreator: trackingActions.loadAccessTokens,
  errorKey: 'tracking.loadError', // TODO
  handle: async ({ dispatch, getState }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `/tracking/devices/${
        getState().tracking.accessTokensDeviceId
      }/access-tokens`,
    });

    for (const accessToken of data) {
      for (const field of ['createdAt', 'timeFrom', 'timeTo']) {
        accessToken[field] = accessToken[field] && new Date(accessToken[field]);
      }
    }

    dispatch(trackingActions.setAccessTokens(data));
  },
};

export const deleteAccessTokenProcessor: Processor<
  typeof trackingActions.deleteAccessToken
> = {
  actionCreator: trackingActions.deleteAccessToken,
  errorKey: 'tracking.deleteError', // TODO
  handle: async ({ dispatch, getState, action }) => {
    await httpRequest({
      getState,
      method: 'GET',
      url: `/tracking/access-tokens/${encodeURIComponent(action.payload)}`,
    });

    dispatch(trackingActions.loadAccessTokens());
  },
};
