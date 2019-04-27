import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingModifyAccessToken } from 'fm3/actions/trackingActions';
import { getAuthAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACKING_SAVE_ACCESS_TOKEN,
  process({ getState, action }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { modifiedAccessTokenId } = getState().tracking;

    if (modifiedAccessTokenId) {
      getAuthAxios(getState)
        .put(`/tracking/access-tokens/${modifiedAccessTokenId}`, action.payload)
        .then(() => {
          dispatch(trackingModifyAccessToken(undefined));
        })
        .catch((err) => {
          dispatch(toastsAddError('settings.savingError', err)); // TODO
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    } else {
      getAuthAxios(getState)
        .post(`/tracking/devices/${getState().tracking.accessTokensDeviceId}/access-tokens`, action.payload)
        .then(() => {
          dispatch(trackingModifyAccessToken(undefined));
        })
        .catch((err) => {
          dispatch(toastsAddError('settings.savingError', err)); // TODO
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    }
  },
});
