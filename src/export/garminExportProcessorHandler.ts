import { exportMapFeatures, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/httpRequest';
import { toastsAdd } from 'fm3/actions/toastsActions';
import length from '@turf/length';
import { lineString } from '@turf/helpers';
import { getExportables } from './garminExport';

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

  const coordinates = getExportables()[exportable]?.(getState());

  if (!Array.isArray(coordinates)) {
    dispatch(
      toastsAdd({
        id: 'gpxExport',
        style: 'danger',
        message: coordinates || 'Error exporting to Garmin',
      }),
    );

    return;
  }

  await httpRequest({
    url: '/garmin-courses',
    method: 'POST',
    data: {
      name,
      description,
      activity,
      coordinates,
      distance: length(lineString(coordinates), { units: 'meters' }),
      elevationGain: 0,
      elevationLoss: 0,
      // speedMetersPerSecond
      // elapsedSeconds
    },
    getState,
  });

  dispatch(
    toastsAdd({
      id: 'gpxExport',
      messageKey: 'general.success',
    }),
  );

  dispatch(setActiveModal(null));
};

export default handle;
