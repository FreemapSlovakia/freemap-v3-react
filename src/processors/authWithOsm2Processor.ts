import { authWithOsm2 } from '../actions/authActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const authWithOsm2Processor: Processor<typeof authWithOsm2> = {
  actionCreator: authWithOsm2,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authWithOsm2ProcessorHandler.js')
    ).default(...params),
};
