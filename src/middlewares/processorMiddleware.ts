import { RootAction } from 'fm3/actions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { sendError } from 'fm3/globalErrorHandler';
import { RootState } from 'fm3/reducers';
import { MessagePaths } from 'fm3/types/common';
import { Dispatch, Middleware } from 'redux';
import {
  Action,
  ActionCreator,
  ActionType,
  isActionOf,
} from 'typesafe-actions';

export type ProcessorHandler<T extends ActionCreator = ActionCreator> =
  (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionType<T>;
  }) => void | Promise<void>;

export interface Processor<T extends ActionCreator = ActionCreator> {
  transform?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionType<T>;
  }) => Action | null | undefined | void;
  handle?: ProcessorHandler<T>;
  actionCreator?: T | T[];
  actionPredicate?: (action: ActionType<T>) => boolean;
  statePredicate?: (state: RootState) => boolean;
  stateChangePredicate?: (state: RootState) => unknown;
  errorKey?: MessagePaths;
  id?: string; // toast collapse key
  predicatesOperation?: 'AND' | 'OR';
}

type MW = Middleware<unknown, RootState, Dispatch<RootAction>> & {
  processors: Processor[];
};

export function createProcessorMiddleware(): MW {
  const processors: Processor[] = [];

  const processorMiddleware: MW =
    ({ getState, dispatch }) =>
    (next: Dispatch) =>
    (action: Action): unknown => {
      const prevState = getState();

      let a: Action = action;

      for (const {
        actionCreator: actionType,
        transform,
        statePredicate,
        actionPredicate,
      } of processors) {
        if (
          transform &&
          (!actionType ||
            (Array.isArray(actionType) &&
              actionType.some((ac) => isActionOf(ac, a))) ||
            isActionOf(actionType, a)) &&
          (!statePredicate || statePredicate(getState())) &&
          (!actionPredicate || actionPredicate(action))
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

        for (const processor of processors) {
          const {
            actionCreator: actionType,
            handle,
            errorKey,
            id,
            statePredicate,
            stateChangePredicate,
            actionPredicate,
            predicatesOperation,
          } = processor;

          if (
            handle &&
            (predicatesOperation === 'OR'
              ? (actionType &&
                  ((Array.isArray(actionType) &&
                    actionType.some((ac) => isActionOf(ac, a))) ||
                    isActionOf(actionType, a))) ||
                statePredicate?.(getState()) ||
                (stateChangePredicate &&
                  stateChangePredicate(getState()) !==
                    stateChangePredicate(prevState)) ||
                actionPredicate?.(action)
              : (!actionType ||
                  (Array.isArray(actionType) &&
                    actionType.some((ac) => isActionOf(ac, a))) ||
                  isActionOf(actionType, a)) &&
                (!statePredicate || statePredicate(getState())) &&
                (!stateChangePredicate ||
                  stateChangePredicate(getState()) !==
                    stateChangePredicate(prevState)) &&
                (!actionPredicate || actionPredicate(action)))
          ) {
            const handleError = (err: unknown) => {
              if (err instanceof DOMException && err.name === 'AbortError') {
                console.log('Canceled: ' + errorKey);
              } else {
                console.log('Error key: ' + errorKey);

                console.error(err);

                dispatch(
                  toastsAdd({
                    id: id ?? Math.random().toString(36).slice(2),
                    messageKey: errorKey,
                    messageParams: !(err instanceof Error)
                      ? { err: String(err) }
                      : (err as any)._fm_fetchError
                      ? {
                          err:
                            (window.navigator.onLine === false
                              ? window.translations?.general.offline
                              : window.translations?.general.connectionError) ??
                            err.message,
                        }
                      : {
                          err: err.message,
                        },
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

      const promise = Promise.all(runProcessors());

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

  processorMiddleware.processors = processors;

  return processorMiddleware;
}
