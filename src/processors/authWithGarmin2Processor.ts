import { authWithGarmin2 } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authWithGarmin2Processor: Processor<typeof authWithGarmin2> = {
  actionCreator: authWithGarmin2,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import('./authWithGarmin2ProcessorHandler')
    ).default(...params),
};
