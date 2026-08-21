import { clearMapFeatures, closeTool } from '@app/store/actions.js';
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
 * Releases the picture and its distance buffer once the panel is done with —
 * including `panoramaClear`, which the URL dispatches when the param goes and
 * which otherwise leaves tens of megabytes held for as long as the tool stays
 * open.
 */
export const panoramaReleaseProcessor: Processor = {
  actionCreator: [closeTool, clearMapFeatures, panoramaClear],
  actionPredicate: (action) =>
    !closeTool.match(action) || action.payload === 'panorama',
  handle: () => {
    clearPanoramaRenderData();
  },
};
