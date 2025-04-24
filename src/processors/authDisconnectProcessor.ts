import { authDisconnect } from '../actions/authActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const authDisconnectProcessor: Processor<typeof authDisconnect> = {
  actionCreator: authDisconnect,
  id: 'lcd',
  errorKey: 'general.operationError',
  handle: async (...params) =>
    await (
      await import('./authDisconnectProcessorHandler.js')
    ).default(...params),
};
