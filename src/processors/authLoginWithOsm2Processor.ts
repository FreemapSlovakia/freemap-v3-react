import { authLoginWithOsm2 } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithOsm2Processor: Processor<typeof authLoginWithOsm2> = {
  actionCreator: authLoginWithOsm2,
  errorKey: 'logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authLoginWithOsm2ProcessorHandler')
    ).default(...params),
};
