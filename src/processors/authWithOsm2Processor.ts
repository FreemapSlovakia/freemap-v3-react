import { authWithOsm2 } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authWithOsm2Processor: Processor<typeof authWithOsm2> = {
  actionCreator: authWithOsm2,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (await import('./authWithOsm2ProcessorHandler')).default(...params),
};
