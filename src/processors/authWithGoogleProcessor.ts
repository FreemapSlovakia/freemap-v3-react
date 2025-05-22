import { authWithGoogle } from '../actions/authActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const authWithGoogleProcessor: Processor<typeof authWithGoogle> = {
  actionCreator: authWithGoogle,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authWithGoogleProcessorHandler.js')
    ).default(...params),
};
