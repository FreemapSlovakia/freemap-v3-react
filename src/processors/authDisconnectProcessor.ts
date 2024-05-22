import { authDisconnect } from 'fm3/actions/authActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authDisconnectProcessor: Processor<typeof authDisconnect> = {
  actionCreator: authDisconnect,
  // errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (await import('./authDisconnectProcessorHandler')).default(...params),
};
