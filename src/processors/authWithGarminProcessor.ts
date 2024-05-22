import { authWithGarmin } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authWithGarminProcessor: Processor<typeof authWithGarmin> = {
  actionCreator: authWithGarmin,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (await import('./authWithGarminProcessorHandler')).handle(...params),
};
