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

      axios.get('//open.mapquestapi.com/elevation/v1/profile', {
        params: {
          key: process.env.MAPQUEST_API_KEY,
          latLngCollection: `${point.lat},${point.lon}`,
        },
        validateStatus: status => status === 200,
        cancelToken: source.token,
      })
      // freemap service
      // axios.get(`//www.freemap.sk/api/0.1/elevation/${point.lat}%7C${point.lon}`, {
      //   validateStatus: status => status === 200,
      // })
        .then(({ data }) => {
          dispatch(elevationMeasurementSetElevation(parseFloat(data.elevationProfile[0].height)));
        })
        .catch((e) => {
          dispatch(toastsAddError(`Nastala chyba pri získavani výšky bodu: ${e.message}`));
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
