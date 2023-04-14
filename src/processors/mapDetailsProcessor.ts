import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapDetailsProcessor: Processor = {
  actionCreator: mapDetailsSetUserSelectedPosition,
  errorKey: 'mapDetails.fetchingError',
  handle: async (...params) =>
    (await import('./mapDetailsProcessorHandler')).default(...params),
};
