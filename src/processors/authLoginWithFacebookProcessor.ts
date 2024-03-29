import { authLoginWithFacebook } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithFacebookProcessor: Processor = {
  actionCreator: authLoginWithFacebook,
  errorKey: 'logIn.logInError',
  handle: async (...params) =>
    (await import('./authLoginWithFacebookProcessorHandler')).default(
      ...params,
    ),
};
