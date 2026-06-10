import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadMapFeaturesExportMessages } from '../../translations/loadMapFeaturesExportMessages.js';
import { exportMapFeatures } from '../actions.js';

export const exportMapFeaturesProcessor: Processor<typeof exportMapFeatures> = {
  actionCreator: exportMapFeatures,
  id: 'mapFeaturesExport',
  handle: async (...params) => {
    const { getState, dispatch } = params[0];

    const { type, target, exportables } = params[0].action.payload;

    window._paq.push([
      'trackEvent',
      'FeaturesExport',
      'export',
      new URLSearchParams({
        type,
        target,
        exportables: [...exportables].sort().join(','),
      }).toString(),
    ]);

    try {
      return (
        target === 'garmin'
          ? await import(
              /* webpackChunkName: "garmin-export-processor-handler" */
              './garminExportProcessorHandler.js'
            )
          : type === 'gpx'
            ? await import(
                /* webpackChunkName: "gpx-export-processor-handler" */
                './gpxExportProcessorHandler.js'
              )
            : await import(
                /* webpackChunkName: "geojson-export-processor-handler" */
                './geojsonExportProcessorHandler.js'
              )
      ).default(...params);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const em = await loadMapFeaturesExportMessages(getState().l10n.language);

      dispatch(
        toastsAdd({ style: 'danger', message: em.exportError({ err }) }),
      );
    }
  },
};
