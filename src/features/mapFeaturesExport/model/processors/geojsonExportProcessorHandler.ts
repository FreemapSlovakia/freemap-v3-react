import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { exportMapFeatures } from '../actions.js';
import { buildFilledFc } from './buildFilledFc.js';
import { exportBlob, licenseNotice, upload } from './upload.js';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  // Data export: lightweight styling properties, every route alternative, a
  // point per GPS sample. Icons stay as `icon`/`marker-symbol` props.
  const fc = await buildFilledFc(
    getState,
    action,
    { props: true },
    {
      route: 'all',
      trackingPoints: true,
    },
  );

  const { target } = action.payload;

  if (
    await upload(
      'geojson',
      exportBlob(
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
        'application/geo+json',
        target,
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
