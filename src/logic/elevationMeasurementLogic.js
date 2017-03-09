import { createLogic } from 'redux-logic';
import { setElevation } from 'fm3/actions/elevationMeasurementActions';

export default createLogic({
  type: 'SET_ELEVATION_POINT',
  process({ getState }, dispatch, done) {
    const point = getState().elevationMeasurement.point;
    if (point) {
      dispatch(setElevation(null));
      fetch(`https://www.freemap.sk/api/0.1/elevation/${point.lat}%7C${point.lon}`)
        .then(res => res.json()).then(data => {
          dispatch(setElevation(parseFloat(data.ele)));
        })
        .catch(() => {})
        .then(() => done());
    } else {
      dispatch(setElevation(null));
      done();
    }
  }
});
