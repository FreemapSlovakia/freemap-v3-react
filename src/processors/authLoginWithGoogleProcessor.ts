import { authLoginWithGoogle } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithGoogleProcessor: Processor = {
  actionCreator: authLoginWithGoogle,
  errorKey: 'logIn.logInError',
  async handle(...params) {
    (
      await import(
        /* webpackChunkName: "authLoginWithGoogleProcessorHandler" */ './authLoginWithGoogleProcessorHandler'
      )
    ).default(...params);
  },
};
