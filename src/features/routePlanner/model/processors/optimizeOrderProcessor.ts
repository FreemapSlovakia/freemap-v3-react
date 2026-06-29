import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { routePlannerOptimizeOrder } from '../actions.js';

export const routePlannerOptimizeOrderProcessor: Processor<
  typeof routePlannerOptimizeOrder
> = {
  actionCreator: routePlannerOptimizeOrder,
  id: 'routePlannerOptimizeOrder',
  // Unexpected throws (the per-leg fetches already degrade to Infinity) fall
  // back to the generic processor-error toast.
  errorKey: 'general.operationError',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "route-planner-optimize-order-processor-handler" */
        './optimizeOrderProcessorHandler.js'
      )
    ).default(...params),
};
