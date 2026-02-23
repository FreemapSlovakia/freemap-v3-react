import { Processor } from '@app/store/middleware/processorMiddleware.js';
import { assert } from 'typia';
import { httpRequest } from '@app/httpRequest.js';
import { GeoIpResult, invokeGeoip, processGeoipResult } from '../actions.js';

export const geoipProcessor: Processor = {
  actionCreator: invokeGeoip,
  async handle({ getState, dispatch }) {
    const res = await httpRequest({
      getState,
      url: '/geoip',
      expectedStatus: 200,
    });

    fetch(`${process.env['API_URL']}/geoip`).then((res) => {
      if (!res.ok) {
        throw new Error('nok');
      }
    });

    const data = await res.json();

    if (data.latitude) {
      data.latitude = Number(data.latitude);
    }

    if (data.longitude) {
      data.longitude = Number(data.longitude);
    }

    dispatch(processGeoipResult(assert<GeoIpResult>(data)));
  },
};
