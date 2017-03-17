import { createLogic } from 'redux-logic';
import { setElevation } from 'fm3/actions/elevationMeasurementActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

export default createLogic({
  type: 'SET_ELEVATION_POINT',
  process({ getState }, dispatch, done) {
    const point = getState().elevationMeasurement.point;
    if (point) {
      dispatch(setElevation(null));
      dispatch(startProgress());
      fetch(`https://www.freemap.sk/api/0.1/elevation/${point.lat}%7C${point.lon}`)
        .then(res => res.json()).then(data => {
          dispatch(setElevation(parseFloat(data.ele)));
        })
        .catch(() => {})
        .then(() => {
          dispatch(stopProgress());
          done();
        });
    } else {
      dispatch(setElevation(null));
      done();
    }
  }
});
