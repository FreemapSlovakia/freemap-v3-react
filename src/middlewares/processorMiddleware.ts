import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import {
  isActionOf,
  ActionCreator,
  ActionType,
  Action,
} from 'typesafe-actions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { sendError } from 'fm3/globalErrorHandler';
import { dispatchAxiosErrorAsToast } from 'fm3/processors/utils';

export interface IProcessor<T extends ActionCreator = ActionCreator> {
  transform?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch<RootAction>;
    action: ActionType<T>;
  }) => Action | null | undefined | void;
  handle?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch<RootAction>;
    action: ActionType<T>;
  }) => void | Promise<void>;
  actionCreator: T | T[] | '*';
  errorKey?: string;
}

export const processors: IProcessor[] = [];

export const processorMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ getState, dispatch }) => next => (action: Action) => {
  const prevState = getState();

  let a: Action = action;

  for (const { actionCreator: actionType, transform } of processors) {
    if (
      transform &&
      (actionType === '*' ||
        (Array.isArray(actionType) &&
          actionType.some(ac => isActionOf(ac, a))) ||
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

  const promises: Promise<void>[] = [];
  for (const { actionCreator: actionType, handle, errorKey } of processors) {
    if (
      handle &&
      (actionType === '*' ||
        (Array.isArray(actionType) &&
          actionType.some(ac => isActionOf(ac, a))) ||
        isActionOf(actionType, a))
    ) {
      const p = handle({ getState, dispatch, action: a, prevState });
      if (p) {
        promises.push(
          errorKey === undefined
            ? p
            : p.catch(err => {
                dispatchAxiosErrorAsToast(dispatch, errorKey, err);
              }),
        );
      }
    }
  }

  let isDone = false;
  const p = Promise.all(promises).then(
    res => {
      isDone = true;
      return res;
    },
    err => {
      isDone = true;
      throw err;
    },
  );

  if (!isDone) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    p.then(
      () => {
        dispatch(stopProgress(pid));
      },
      error => {
        dispatch(stopProgress(pid));

        sendError({ kind: 'processor', error, action });

        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.processorError',
            messageParams: {
              error,
            },
          }),
        );
      },
    );
  }

  return result;
};
