import { authWithGarmin } from '../actions/authActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const authWithGarminProcessor: Processor<typeof authWithGarmin> = {
  actionCreator: authWithGarmin,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authWithGarminProcessorHandler.js')
    ).handle(...params),
};
