import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authWithOsm } from '../actions.js';

export const authWithOsmProcessor: Processor<typeof authWithOsm> = {
  actionCreator: authWithOsm,
  id: 'lcd',
  errorKey: 'auth.logIn.logInError',
  handle: async (...params) =>
    await (
      await import(
        /* webpackChunkName: "auth-with-osm-processor-handler" */
        './authWithOsmProcessorHandler.js'
      )
    ).default(...params),
};
