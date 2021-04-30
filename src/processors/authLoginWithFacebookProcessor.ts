import { authLoginWithFacebook } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithFacebookProcessor: Processor = {
  actionCreator: authLoginWithFacebook,
  errorKey: 'logIn.logInError',
  async handle(...params) {
    (
      await import(
        /* webpackChunkName: "authLoginWithFacebookProcessorHandler" */ './authLoginWithFacebookProcessorHandler'
      )
    ).default(...params);
  },
};
