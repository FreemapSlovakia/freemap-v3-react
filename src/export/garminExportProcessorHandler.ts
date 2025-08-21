import { lineString } from '@turf/helpers';
import { length } from '@turf/length';
import { authWithGarmin } from '../actions/authActions.js';
import { exportMapFeatures, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { HttpError, httpRequest } from '../httpRequest.js';
import type { ProcessorHandler } from '../middlewares/processorMiddleware.js';
import { getExportables } from './garminExport.js';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const {
    exportables: [exportable],
    name,
    description,
    activity,
  } = action.payload;

  const result = getExportables()[exportable]?.(getState());

  if (!result || typeof result === 'string') {
    dispatch(
      toastsAdd({
        id: 'mapFeaturesExport',
        style: 'danger',
        message: result || 'Error exporting to Garmin',
      }),
    );

    return;
  }

  const res = await httpRequest({
    url: '/garmin-courses',
    method: 'POST',
    data: {
      name,
      description,
      activity,
      coordinates: result.coordinates,
      distance:
        result.distance ??
        length(lineString(result.coordinates), { units: 'meters' }),
      elevationGain: result.elevationGain ?? 0,
      elevationLoss: result.elevationLoss ?? 0,
      speedMetersPerSecond: result.speedMetersPerSecond,
      elapsedSeconds: result.elapsedSeconds,
    },
    getState,
    expectedStatus: null,
  });

  if (res.status === 204) {
    dispatch(
      toastsAdd({
        style: 'success',
        id: 'mapFeaturesExport',
        messageKey: 'general.success',
      }),
    );

    dispatch(setActiveModal(null));

    return;
  }

  const body = await res.text();

  if (res.status === 401 && body === 'invalid oauth token') {
    dispatch(authWithGarmin({ connect: false, successAction: action }));
  } else if (res.status === 403 && body === 'missing permission') {
    dispatch(
      toastsAdd({
        id: 'mapFeaturesExport',
        timeout: 5000,
        style: 'danger',
        messageKey: 'exportMapFeatures.garmin.revoked',
      }),
    );
  } else {
    throw new HttpError(res.status, body);
  }
};

export default handle;
