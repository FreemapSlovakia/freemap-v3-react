import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { clearPanoramaRenderData } from '../../renderHolder.js';
import { panoramaClear, panoramaPick, panoramaRender } from '../actions.js';

export const panoramaRenderProcessor: Processor = {
  actionCreator: [panoramaPick, panoramaRender],
  id: 'panorama',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "panorama-render-processor-handler" */
        './panoramaRenderProcessorHandler.js'
      )
    ).default(...params),
};

/**
 * Releases the picture and its distance buffer once the panorama is given up
 * on: the map cleared, or `panoramaClear`, which the URL dispatches when the
 * param goes.
 *
 * Not on merely closing the panel, so reopening finds the picture still there.
 * That is deliberately expensive: the depth buffer alone is two bytes a pixel —
 * tens of megabytes at the finest tier — held until the map is cleared. The
 * trade is against seconds of a server that renders one panorama at a time.
 */
export const panoramaReleaseProcessor: Processor = {
  actionCreator: [clearMapFeatures, panoramaClear],
  handle: () => {
    clearPanoramaRenderData();
  },
};
