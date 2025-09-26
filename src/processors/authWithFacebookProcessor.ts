import { authWithFacebook } from '../actions/authActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
