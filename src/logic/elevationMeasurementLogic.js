import { createLogic } from 'redux-logic';
import { elevationMeasurementSetElevation } from 'fm3/actions/elevationMeasurementActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

export default createLogic({
  type: 'ELEVATION_MEASUREMENT_SET_POINT',
  cancelType: ['ELEVATION_MEASUREMENT_SET_POINT', 'SET_TOOL', 'MAP_RESET'],
  process({ getState }, dispatch, done) {
    const point = getState().elevationMeasurement.point;
    if (point) {
      dispatch(startProgress());
      fetch(`//www.freemap.sk/api/0.1/elevation/${point.lat}%7C${point.lon}`)
        .then(res => res.json()).then((data) => {
          dispatch(elevationMeasurementSetElevation(parseFloat(data.ele)));
        })
        .catch(() => {})
        .then(() => {
          dispatch(stopProgress());
          done();
        });
    } else {
      dispatch(elevationMeasurementSetElevation(null));
      done();
    }
  },
});
