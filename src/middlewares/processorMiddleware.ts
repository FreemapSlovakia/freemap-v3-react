import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { isActionOf, ActionCreator, ActionType } from 'typesafe-actions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { sendError } from 'fm3/globalErrorHandler';

export interface IProcessor<T extends ActionCreator = ActionCreator> {
  handle: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch<RootAction>;
    action: ActionType<T>;
  }) => void | Promise<void>;
  actionCreator: T | T[] | '*';
}

export const processors: IProcessor[] = [];

export const processorMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ getState, dispatch }) => next => (action: RootAction) => {
  const prevState = getState();
  const result = next(action);

  const promises: Promise<void>[] = [];
  if (typeof action == 'object' && action && typeof action.type == 'string') {
    for (const { actionCreator: actionType, handle } of processors) {
      if (
        actionType === '*' ||
        (Array.isArray(actionType) &&
          actionType.some(ac => isActionOf(ac, action))) ||
        isActionOf(actionType, action)
      ) {
        const p = handle({ getState, dispatch, action, prevState });
        if (p) {
          promises.push(p);
        }
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
