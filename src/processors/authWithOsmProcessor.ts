import { authWithOsm } from '../actions/authActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const authWithOsmProcessor: Processor<typeof authWithOsm> = {
  actionCreator: authWithOsm,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (await import('./authWithOsmProcessorHandler.js')).default(...params),
};
