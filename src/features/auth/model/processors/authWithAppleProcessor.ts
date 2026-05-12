import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authWithApple } from '../actions.js';

export const authWithAppleProcessor: Processor<typeof authWithApple> = {
  actionCreator: authWithApple,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "auth-with-apple-processor-handler" */
        './authWithAppleProcessorHandler.js'
      )
    ).default(...params),
};
