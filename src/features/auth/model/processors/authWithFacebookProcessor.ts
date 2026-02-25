import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authWithFacebook } from '../actions.js';

export const authWithFacebookProcessor: Processor<typeof authWithFacebook> = {
  actionCreator: authWithFacebook,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "auth-with-facebook-processor-handler" */
        './authWithFacebookProcessorHandler.js'
      )
    ).default(...params),
};
