import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { exportMapFeatures } from '../actions.js';
import { buildExportFeatureCollection } from '../buildExportFeatureCollection.js';
import { licenseNotice, upload } from './upload.js';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const set = new Set(action.payload.exportables);

  const fc = await buildExportFeatureCollection({
    getState,
    include: {
      pictures: set.has('pictures'),
      drawingLines: set.has('drawingLines'),
      drawingAreas: set.has('drawingAreas'),
      drawingPoints: set.has('drawingPoints'),
      objects: set.has('objects'),
      plannedRoute: set.has('plannedRoute'),
      plannedRouteWithStops: set.has('plannedRouteWithStops'),
      tracking: set.has('tracking'),
      import: set.has('import'),
      search: set.has('search'),
    },
    // Data export: lightweight styling properties, every route alternative, a
    // point per GPS sample. Icons stay as `icon`/`marker-symbol` props.
    pointMode: { props: true },
    options: { route: 'all', trackingPoints: true },
  });

  const { target } = action.payload;

  if (
    await upload(
      'geojson',
      new Blob(
        [
          JSON.stringify({
            ...fc,
            ...{
              metadata: {
                description: 'Exported from https://www.freemap.sk/',
                licenseNotice,
                time: new Date().toISOString(),
                content: action.payload.exportables,
              },
            },
          }),
        ],
        {
          type:
            target === 'dropbox'
              ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
              : 'application/geo+json',
        },
      ),
      target,
      getState,
      dispatch,
    )
  ) {
    dispatch(setActiveModal(null));
  }
};

export default handle;
