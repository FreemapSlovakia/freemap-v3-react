import { exportMapFeatures, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { HttpError, httpRequest } from 'fm3/httpRequest';
import { toastsAdd } from 'fm3/actions/toastsActions';
import length from '@turf/length';
import { lineString } from '@turf/helpers';
import { getExportables } from './garminExport';
import { authWithGarmin } from 'fm3/actions/authActions';

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
        id: 'gpxExport',
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
        id: 'gpxExport',
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
        id: 'gpxExport',
        timeout: 5000,
        style: 'danger',
        message: 'Exporting course to Garmin has been revoked.',
      }),
    );
  } else {
    throw new HttpError(res.status, body);
  }
};

export default handle;
