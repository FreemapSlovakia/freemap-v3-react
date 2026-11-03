import { HttpError } from '@app/httpRequest.js';
import type {
  BaseActionCreator,
  Processor,
  ProcessorHandler,
} from '@app/store/middleware/processorMiddleware.js';
import { stopProgress } from '@features/progress/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from 'redux';
import { OAUTH_PROGRESS_ID } from '../popupOAuthProviders.js';
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
import authWithPopupOAuthHandler from './processors/authWithPopupOAuthProcessorHandler.js';
import { AUTH_PROVIDER_LABELS, type AuthProvider } from './types.js';

// All auth-with processors share the same shape: lazily import the handler
// (keeping it in its own chunk) and surface login errors under one key.
function makeAuthProcessor<T extends BaseActionCreator>(
  actionCreator: T,
  /** Which provider the action logs in with, for the messages. */
  provider:
    | AuthProvider
    | ((action: Parameters<ProcessorHandler<T>>[0]['action']) => AuthProvider),
  loader: () => Promise<{ default: ProcessorHandler<T> }>,
  /** Runs however it ends, a handler chunk that fails to load included. */
  onSettled?: (dispatch: Dispatch) => void,
): Processor<T> {
  return {
    actionCreator,
    handle: async (params) => {
      try {
        return await (await loader()).default(params);
      } catch (err) {
        // The API refuses to connect another remote account than the one
        // already connected.
        if (err instanceof HttpError && err.status === 409) {
          params.dispatch(
            toastsAdd({
              id: 'lcd',
              style: 'warning',
              messageKey: 'differentAccount',
              messageParams: {
                provider:
                  AUTH_PROVIDER_LABELS[
                    typeof provider === 'string'
                      ? provider
                      : provider(params.action)
                  ],
              },
              messageLoader: loadAuthMessages,
            }),
          );

          return;
        }

        await params.toastError(err, loadAuthMessages, 'logInError', 'lcd');
      } finally {
        onSettled?.(params.dispatch);
      }
    },
  };
}

export const authProcessors: Processor[] = [
  makeAuthProcessor(
    authWithFacebook,
    'facebook',
    () =>
      import(
        /* webpackChunkName: "auth-with-facebook-processor-handler" */
        './processors/authWithFacebookProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithGoogle,
    'google',
    () =>
      import(
        /* webpackChunkName: "auth-with-google-processor-handler" */
        './processors/authWithGoogleProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithApple,
    'apple',
    () =>
      import(
        /* webpackChunkName: "auth-with-apple-processor-handler" */
        './processors/authWithAppleProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithGarmin,
    'garmin',
    () =>
      import(
        /* webpackChunkName: "auth-with-garmin-processor-handler" */
        './processors/authWithGarminProcessorHandler.js'
      ),
  ),
  makeAuthProcessor(
    authWithGarmin2,
    'garmin',
    () =>
      import(
        /* webpackChunkName: "auth-with-garmin2-processor-handler" */
        './processors/authWithGarmin2ProcessorHandler.js'
      ),
  ),
  // Bundled: loading a chunk first could take the popup past the click's user
  // activation, and the browser would block it.
  makeAuthProcessor(
    authWithPopupOAuth,
    (action) => action.payload.provider,
    async () => ({ default: authWithPopupOAuthHandler }),
  ),
  makeAuthProcessor(
    authWithOAuthCode,
    (action) => action.payload.provider,
    () =>
      import(
        /* webpackChunkName: "auth-with-oauth-code-processor-handler" */
        './processors/authWithOAuthCodeProcessorHandler.js'
      ),
    // After `successAction` has started, so a busy state it holds never lapses.
    (dispatch) => dispatch(stopProgress(OAUTH_PROGRESS_ID)),
  ),
];
