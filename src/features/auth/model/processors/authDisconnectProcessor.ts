import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authDisconnect } from '../actions.js';

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
