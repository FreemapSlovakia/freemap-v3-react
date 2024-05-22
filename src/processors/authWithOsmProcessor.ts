import { authWithOsm } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authWithOsmProcessor: Processor<typeof authWithOsm> = {
  actionCreator: authWithOsm,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (await import('./authWithOsmProcessorHandler')).default(...params),
};
