import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authWithGarmin } from '../actions.js';

export const authWithGarminProcessor: Processor<typeof authWithGarmin> = {
  actionCreator: authWithGarmin,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import(
        /* webpackChunkName: "auth-with-garmin-processor-handler" */
        './authWithGarminProcessorHandler.js'
      )
    ).handle(...params),
};
