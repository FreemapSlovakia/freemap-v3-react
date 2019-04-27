import axios from 'axios';
import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingModifyAccessToken } from 'fm3/actions/trackingActions';

export default createLogic({
  type: at.TRACKING_SAVE_ACCESS_TOKEN,
  process({ getState, action }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { modifiedAccessTokenId } = getState().tracking;

    if (modifiedAccessTokenId) {
      axios.put(
        `${process.env.API_URL}/tracking/access-tokens/${modifiedAccessTokenId}`,
        action.payload,
        {
          headers: {
            Authorization: `Bearer ${getState().auth.user.authToken}`,
          },
          validateStatus: status => status === 200,
        },
      )
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
      axios.post(
        `${process.env.API_URL}/tracking/devices/${getState().tracking.modifiedDeviceId}/access-tokens`,
        action.payload,
        {
          headers: {
            Authorization: `Bearer ${getState().auth.user.authToken}`,
          },
          validateStatus: status => status === 200,
        },
      )
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
