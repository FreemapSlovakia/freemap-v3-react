import type {
  BaseActionCreator,
  Processor,
  ProcessorHandler,
} from '@app/store/middleware/processorMiddleware.js';
import { loadAuthMessages } from '../translations/loadAuthMessages.js';
import {
  authWithApple,
  authWithFacebook,
  authWithGarmin,
  authWithGarmin2,
  authWithGoogle,
  authWithOAuthCode,
  authWithPopupOAuth,
} from './actions.js';

// All auth-with processors share the same shape: lazily import the handler
// (keeping it in its own chunk) and surface login errors under one key.
function makeAuthProcessor<T extends BaseActionCreator>(
  actionCreator: T,
  loader: () => Promise<{ default: ProcessorHandler<T> }>,
): Processor<T> {
  return {
    actionCreator,
    handle: async (params) => {
      try {
        return await (await loader()).default(params);
      } catch (err) {
        await params.toastError(err, loadAuthMessages, 'logInError', 'lcd');
      }
    },
  };
}

export const authProcessors: Processor[] = [
  makeAuthProcessor(
    authWithFacebook,
    () =>
      import(
        /* webpackChunkName: "auth-with-facebook-processor-handler" */
        './processors/authWithFacebookProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithGoogle,
    () =>
      import(
        /* webpackChunkName: "auth-with-google-processor-handler" */
        './processors/authWithGoogleProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithApple,
    () =>
      import(
        /* webpackChunkName: "auth-with-apple-processor-handler" */
        './processors/authWithAppleProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithGarmin,
    () =>
      import(
        /* webpackChunkName: "auth-with-garmin-processor-handler" */
        './processors/authWithGarminProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithGarmin2,
    () =>
      import(
        /* webpackChunkName: "auth-with-garmin2-processor-handler" */
        './processors/authWithGarmin2ProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithPopupOAuth,
    () =>
      import(
        /* webpackChunkName: "auth-with-popup-oauth-processor-handler" */
        './processors/authWithPopupOAuthProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithOAuthCode,
    () =>
      import(
        /* webpackChunkName: "auth-with-oauth-code-processor-handler" */
        './processors/authWithOAuthCodeProcessorHandler.js'
      ),
  ),
];
