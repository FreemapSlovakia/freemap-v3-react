import axios from 'axios';
import { RootAction } from 'fm3/actions';
import {
  authLoginWithFacebook,
  authLoginWithGoogle,
  authLoginWithOsm,
  authLoginWithOsm2,
} from 'fm3/actions/authActions';
import { galleryUpload } from 'fm3/actions/galleryActions';
import {
  exportGpx,
  exportPdf,
  startProgress,
  stopProgress,
} from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { sendError } from 'fm3/globalErrorHandler';
import { RootState } from 'fm3/storeCreator';
import { MessagePaths } from 'fm3/types/common';
import { Dispatch, Middleware } from 'redux';
import {
  Action,
  ActionCreator,
  ActionType,
  getType,
  isActionOf,
} from 'typesafe-actions';

export interface Processor<T extends ActionCreator = ActionCreator> {
  transform?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionType<T>;
  }) => Action | null | undefined | void;
  handle?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionType<T>;
  }) => void | Promise<void>;
  actionCreator: T | T[] | '*';
  errorKey?: MessagePaths;
  id?: string; // toast collapse key
}

export const processors: Processor[] = [];

const lazy: Record<string, () => Promise<{ default: Processor }>> = {
  [getType(exportGpx)]: () =>
    import(
      /* webpackChunkName: "gpxExportProcessor" */ 'fm3/processors/gpxExportProcessor'
    ),

  [getType(exportPdf)]: () =>
    import(
      /* webpackChunkName: "exportPdfProcessor" */ 'fm3/processors/pdfExportProcessor'
    ),

  [getType(galleryUpload)]: () =>
    import(
      /* webpackChunkName: "galleryItemUploadProcessor" */ 'fm3/processors/galleryItemUploadProcessor'
    ),

  [getType(authLoginWithFacebook)]: () =>
    import(
      /* webpackChunkName: "authLoginWithFacebookProcessor" */ 'fm3/processors/authLoginWithFacebookProcessor'
    ),

  [getType(authLoginWithGoogle)]: () =>
    import(
      /* webpackChunkName: "authLoginWithGoogleProcessor" */ 'fm3/processors/authLoginWithGoogleProcessor'
    ),

  [getType(authLoginWithOsm)]: () =>
    import(
      /* webpackChunkName: "authLoginWithOsmProcessor" */ 'fm3/processors/authLoginWithOsmProcessor'
    ),

  [getType(authLoginWithOsm2)]: () =>
    import(
      /* webpackChunkName: "authLoginWithOsm2Processor" */ 'fm3/processors/authLoginWithOsm2Processor'
    ),
};

export const processorMiddleware: Middleware<
  unknown,
  RootState,
  Dispatch<RootAction>
> = ({ getState, dispatch }) => (next: Dispatch) => (
  action: Action,
): unknown => {
  const prevState = getState();

  let a: Action = action;

  for (const { actionCreator: actionType, transform } of processors) {
    if (
      transform &&
      (actionType === '*' ||
        (Array.isArray(actionType) &&
          actionType.some((ac) => isActionOf(ac, a))) ||
        isActionOf(actionType, a))
    ) {
      const a1 = transform({ getState, dispatch, action: a, prevState });

      if (!a1) {
        return undefined;
      }

      a = a1;
    }
  }

  const result = next(a);

  function runProcessors() {
    const promises: Promise<void>[] = [];

    for (const {
      actionCreator: actionType,
      handle,
      errorKey,
      id,
    } of processors) {
      if (
        handle &&
        (actionType === '*' ||
          (Array.isArray(actionType) &&
            actionType.some((ac) => isActionOf(ac, a))) ||
          isActionOf(actionType, a))
      ) {
        const handleError = (err: unknown) => {
          if (axios.isCancel(err)) {
            console.log('Canceled: ' + errorKey);
          } else {
            console.log('Error key: ' + errorKey);

            console.error(err);

            dispatch(
              toastsAdd({
                id: id ?? Math.random().toString(36).slice(2),
                messageKey: errorKey,
                messageParams: err instanceof Error ? { err: err.message } : {},

                style: 'danger',
              }),
            );
          }
        };

        let promise;

        try {
          promise = handle({ getState, dispatch, action: a, prevState });
        } catch (err) {
          handleError(err);
        }

        if (promise) {
          promises.push(
            errorKey === undefined ? promise : promise.catch(handleError),
          );
        }
      }
    }

    return promises;
  }

  let promise: Promise<unknown>;

  const loader = lazy[a.type];

  if (loader) {
    delete lazy[a.type];

    promise = loader().then(({ default: processor }) => {
      processors.push(processor);

      return Promise.all(runProcessors());
    });
  } else {
    promise = Promise.all(runProcessors());
  }

  let isDone = false;

  const p = promise.then(
    (res) => {
      isDone = true;
      return res;
    },
    (err) => {
      isDone = true;
      throw err;
    },
  );

  setTimeout(() => {
    if (isDone) {
      return;
    }

    const pid = Math.random();

    dispatch(startProgress(pid));

    p.then(
      () => {
        dispatch(stopProgress(pid));
      },
      (error) => {
        dispatch(stopProgress(pid));

        sendError({ kind: 'processor', error, action });

        dispatch(
          toastsAdd({
            id: Math.random().toString(36).slice(2),
            style: 'danger',
            messageKey: 'general.processorError',
            messageParams: {
              err: error,
            },
          }),
        );
      },
    );
  });

  return result;
};
