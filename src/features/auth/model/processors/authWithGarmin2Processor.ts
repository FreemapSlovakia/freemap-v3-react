import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authWithGarmin2 } from '../actions.js';

export const authWithGarmin2Processor: Processor<typeof authWithGarmin2> = {
  actionCreator: authWithGarmin2,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import(
        /* webpackChunkName: "auth-with-garmin2-processor-handler" */
        './authWithGarmin2ProcessorHandler.js'
      )
    ).default(...params),
};
