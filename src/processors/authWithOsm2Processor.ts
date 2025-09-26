import { authWithOsm2 } from '../actions/authActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const authWithOsm2Processor: Processor<typeof authWithOsm2> = {
  actionCreator: authWithOsm2,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import(
        /* webpackChunkName: "auth-with-osm2-processor-handler" */
        './authWithOsm2ProcessorHandler.js'
      )
    ).default(...params),
};
