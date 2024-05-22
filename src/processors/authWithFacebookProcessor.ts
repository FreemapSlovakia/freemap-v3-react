import { authWithFacebook } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authWithFacebookProcessor: Processor<typeof authWithFacebook> = {
  actionCreator: authWithFacebook,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    (await import('./authWithFacebookProcessorHandler')).default(...params),
};
