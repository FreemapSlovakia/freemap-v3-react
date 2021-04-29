import { authLoginWithOsm } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithOsmProcessor: Processor = {
  actionCreator: authLoginWithOsm,
  errorKey: 'logIn.logInError',
  handle: async (...params) => {
    (
      await import(
        /* webpackChunkName: "authLoginWithOsmProcessorHandler" */ './authLoginWithOsmProcessorHandler'
      )
    ).default(...params);
  },
};
