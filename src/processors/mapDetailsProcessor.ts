import { mapDetailsSetUserSelectedPosition } from '../actions/mapDetailsActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const mapDetailsProcessor: Processor = {
  actionCreator: mapDetailsSetUserSelectedPosition,
  errorKey: 'mapDetails.fetchingError',
  handle: async (...params) =>
    (await import('./mapDetailsProcessorHandler.js')).default(...params),
};
