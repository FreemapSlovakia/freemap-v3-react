import {
  elevationMeasurementSetElevation,
  elevationMeasurementSetPoint,
} from 'fm3/actions/elevationMeasurementActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { clearMap } from 'fm3/actions/mainActions';
import { dispatchAxiosErrorAsToast } from './utils';

export const elevationMeasurementProcessor: IProcessor = {
  actionCreator: elevationMeasurementSetPoint,
  handle: async ({ getState, dispatch }) => {
    const { point } = getState().elevationMeasurement;
    if (!point) {
      dispatch(elevationMeasurementSetElevation(null));
      return;
    }

    try {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: '/geotools/elevation',
        params: {
          coordinates: `${point.lat},${point.lon}`,
        },
        cancelActions: [elevationMeasurementSetPoint, clearMap],
      });
      dispatch(elevationMeasurementSetElevation(parseFloat(data[0])));
    } catch (err) {
      dispatchAxiosErrorAsToast(
        dispatch,
        'measurement.elevationFetchError',
        err,
      );
    }
  },
};
