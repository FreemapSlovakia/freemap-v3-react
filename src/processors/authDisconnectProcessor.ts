import { authDisconnect } from '../actions/authActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const authDisconnectProcessor: Processor<typeof authDisconnect> = {
  actionCreator: authDisconnect,
  id: 'lcd',
  errorKey: 'general.operationError',
  handle: async (...params) =>
    await (
      await import(
        /* webpackChunkName: "auth-disconnect-processor-handler" */
        './authDisconnectProcessorHandler.js'
      )
    ).default(...params),
};
