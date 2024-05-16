import { authLoginWithGarmin2 } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLoginWithGarmin2Processor: Processor<
  typeof authLoginWithGarmin2
> = {
  actionCreator: authLoginWithGarmin2,
  errorKey: 'logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authLoginWithGarmin2ProcessorHandler')
    ).default(...params),
};
