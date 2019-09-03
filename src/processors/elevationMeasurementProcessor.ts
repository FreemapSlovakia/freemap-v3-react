import {
  elevationMeasurementSetElevation,
  elevationMeasurementSetPoint,
} from 'fm3/actions/elevationMeasurementActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { clearMap } from 'fm3/actions/mainActions';
import { assertType } from 'typescript-is';

export const elevationMeasurementProcessor: Processor = {
  actionCreator: elevationMeasurementSetPoint,
  errorKey: 'measurement.elevationFetchError',
  handle: async ({ getState, dispatch }) => {
    const { point } = getState().elevationMeasurement;
    if (!point) {
      dispatch(elevationMeasurementSetElevation(null));
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: '/geotools/elevation',
      params: {
        coordinates: `${point.lat},${point.lon}`,
      },
      cancelActions: [elevationMeasurementSetPoint, clearMap],
    });

    dispatch(elevationMeasurementSetElevation(assertType<[number]>(data)[0]));
  },
};
