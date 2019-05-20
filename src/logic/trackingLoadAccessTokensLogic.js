import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingSetAccessTokens } from 'fm3/actions/trackingActions';
import { getAuthAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACKING_LOAD_ACCESS_TOKENS,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    getAuthAxios(getState)
      .get(`/tracking/devices/${getState().tracking.accessTokensDeviceId}/access-tokens`)
      .then(({ data }) => {
        for (const accessToken of data) {
          for (const field of ['createdAt', 'timeFrom', 'timeTo']) {
            accessToken[field] = accessToken[field] && new Date(accessToken[field]);
          }
        }
        dispatch(trackingSetAccessTokens(data));
      })
      .catch((err) => {
        dispatch(toastsAddError('settings.savingError', err)); // TODO
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
