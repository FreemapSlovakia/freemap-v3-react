import axios from 'axios';
import { createLogic } from 'redux-logic';

import { elevationMeasurementSetElevation } from 'fm3/actions/elevationMeasurementActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: 'ELEVATION_MEASUREMENT_SET_POINT',
  cancelType: ['ELEVATION_MEASUREMENT_SET_POINT', 'SET_TOOL', 'MAP_RESET'],
  process({ getState, cancelled$ }, dispatch, done) {
    const point = getState().elevationMeasurement.point;
    if (point) {
      const pid = Math.random();
      dispatch(startProgress(pid));
      cancelled$.subscribe(() => {
        dispatch(stopProgress(pid));
      });

      axios.get(`//www.freemap.sk/api/0.1/elevation/${point.lat}%7C${point.lon}`, {
        validateStatus: status => status === 200,
      })
        .then(({ data }) => {
          dispatch(elevationMeasurementSetElevation(parseFloat(data.ele)));
        })
        .catch((e) => {
          dispatch(toastsAddError(`Nastala chyba pri získavani výšky bodu: ${e.message}`));
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    } else {
      dispatch(elevationMeasurementSetElevation(null));
      done();
    }
  },
});
