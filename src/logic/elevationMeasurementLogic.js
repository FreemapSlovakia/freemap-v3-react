import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { elevationMeasurementSetElevation } from 'fm3/actions/elevationMeasurementActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.ELEVATION_MEASUREMENT_SET_POINT,
  cancelType: [at.ELEVATION_MEASUREMENT_SET_POINT, at.CLEAR_MAP],
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const { point } = getState().elevationMeasurement;
    if (point) {
      const pid = Math.random();
      dispatch(startProgress(pid));
      const source = axios.CancelToken.source();
      cancelled$.subscribe(() => {
        source.cancel();
      });

      axios.get(`${process.env.API_URL}/geotools/elevation`, {
        params: {
          coordinates: `${point.lat},${point.lon}`,
        },
        validateStatus: status => status === 200,
        cancelToken: source.token,
      })
        .then(({ data }) => {
          dispatch(elevationMeasurementSetElevation(parseFloat(data[0])));
        })
        .catch((err) => {
          dispatch(toastsAddError('measurement.elevationFetchError', err));
        })
        .then(() => {
          storeDispatch(stopProgress(pid));
          done();
        });
    } else {
      dispatch(elevationMeasurementSetElevation(null));
      done();
    }
  },
});
