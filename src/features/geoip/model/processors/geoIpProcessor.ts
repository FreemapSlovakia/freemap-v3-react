import { httpRequest } from '@app/httpRequest.js';
import { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  GeoIpResultSchema,
  invokeGeoip,
  processGeoipResult,
} from '../actions.js';

export const geoipProcessor: Processor = {
  errorKey: 'general.connectionError',
  actionCreator: invokeGeoip,
  async handle({ getState, dispatch }) {
    // Best-effort startup geolocation; offline it can't work and would only
    // raise a spurious connection-error toast, so skip it.
    if (!navigator.onLine) {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/geoip',
      expectedStatus: 200,
    });

    const data = await res.json();

    if (data.latitude) {
      data.latitude = Number(data.latitude);
    }

    if (data.longitude) {
      data.longitude = Number(data.longitude);
    }

    dispatch(processGeoipResult(GeoIpResultSchema.parse(data)));
  },
};
