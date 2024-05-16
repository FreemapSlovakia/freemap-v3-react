import { authLoginWithGarmin } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithGarminProcessor: Processor = {
  actionCreator: authLoginWithGarmin,
  errorKey: 'logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authLoginWithGarminProcessorHandler')
    ).handle(...params),
};
