import { RootAction } from 'fm3/actions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { sendError } from 'fm3/globalErrorHandler';
import { RootState } from 'fm3/store';
import { MessagePaths } from 'fm3/types/common';
import { Action, Dispatch, Middleware } from 'redux';
import {
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from '@reduxjs/toolkit';

type AnyActionCreator =
  | ActionCreatorWithPayload<any>
  | ActionCreatorWithoutPayload;

type ActionOf<T extends AnyActionCreator> = ReturnType<T>;

type ActionOfUnion<T extends AnyActionCreator[]> = ReturnType<T[number]>;

type ActionFrom<T> = T extends AnyActionCreator
  ? ActionOf<T>
  : T extends AnyActionCreator[]
    ? ActionOfUnion<T>
    : Action;

export type ProcessorHandler<T extends AnyActionCreator = AnyActionCreator> =
  (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionFrom<T>;
  }) => void | Promise<void>;

export interface Processor<T extends AnyActionCreator = AnyActionCreator> {
  transform?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionFrom<T>;
  }) => Action | null | undefined | void;
  handle?: ProcessorHandler<T>;
  actionCreator?: T | T[];
  actionPredicate?: (action: ActionFrom<T>) => boolean;
  statePredicate?: (state: RootState) => boolean;
  stateChangePredicate?: (state: RootState) => unknown;
  errorKey?: MessagePaths;
  id?: string;
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

      let a = action;

      for (const {
        actionCreator: actionType,
        transform,
        statePredicate,
        actionPredicate,
      } of processors) {
        if (
          transform &&
          (!actionType ||
            (Array.isArray(actionType)
              ? actionType.some((ac) => ac.match(a))
              : actionType.match(a))) &&
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
                  (Array.isArray(actionType)
                    ? actionType.some((ac) => ac.match(a))
                    : actionType.match(a))) ||
                statePredicate?.(getState()) ||
                (stateChangePredicate &&
                  stateChangePredicate(getState()) !==
                    stateChangePredicate(prevState)) ||
                actionPredicate?.(action)
              : (!actionType ||
                  (Array.isArray(actionType)
                    ? actionType.some((ac) => ac.match(a))
                    : actionType.match(a))) &&
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
                    messageParams: { err },
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
