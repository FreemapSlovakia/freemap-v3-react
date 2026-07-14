import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { authDisconnect } from '../actions.js';

export const authDisconnectProcessor: Processor<typeof authDisconnect> = {
  actionCreator: authDisconnect,
  id: 'lcd',
  errorKey: 'general.operationError',
  handle: async (...params) => {
    trackMatomo([
      'trackEvent',
      'Auth',
      'disconnect',
      params[0].action.payload.provider,
    ]);

    return await (
      await import(
        /* webpackChunkName: "auth-disconnect-processor-handler" */
        './authDisconnectProcessorHandler.js'
      )
    ).default(...params);
  },
};
