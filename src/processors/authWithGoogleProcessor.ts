import { authWithGoogle } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authWithGoogleProcessor: Processor<typeof authWithGoogle> = {
  actionCreator: authWithGoogle,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (await import('./authWithGoogleProcessorHandler')).default(...params),
};
