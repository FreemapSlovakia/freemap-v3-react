import { authWithGarmin2 } from '../actions/authActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const authWithGarmin2Processor: Processor<typeof authWithGarmin2> = {
  actionCreator: authWithGarmin2,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authWithGarmin2ProcessorHandler.js')
    ).default(...params),
};
