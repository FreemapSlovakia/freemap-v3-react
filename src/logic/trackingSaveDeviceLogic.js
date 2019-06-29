import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { getAuthAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACKING_SAVE_DEVICE,
  process({ getState, action }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { modifiedDeviceId } = getState().tracking;

    if (modifiedDeviceId) {
      getAuthAxios(getState)
        .put(`/tracking/devices/${modifiedDeviceId}`, action.payload)
        .then(() => {
          dispatch(trackingActions.trackingModifyDevice(undefined));
        })
        .catch(err => {
          dispatch(toastsAddError('tracking.savingError', err)); // TODO
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    } else {
      getAuthAxios(getState)
        .post('/tracking/devices', action.payload)
        .then(() => {
          dispatch(trackingActions.modifyDevice(undefined));
        })
        .catch(err => {
          dispatch(toastsAddError('tracking.savingError', err)); // TODO
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    }
  },
});
