import type { PayloadAction } from '@reduxjs/toolkit';
import type { Action, Dispatch, Middleware } from 'redux';
import { startProgress, stopProgress } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { sendError } from '../globalErrorHandler.js';
import type { RootState } from '../store.js';
import type { MessagePaths } from '../types/common.js';

type BaseActionCreator<P = any, T extends string = string> = {
  (payload: P): PayloadAction<P, T>;
  type: T;
  match: (action: unknown) => action is PayloadAction<P, T>;
};

type ActionOf<T extends BaseActionCreator> = ReturnType<T>;

type ActionOfUnion<T extends BaseActionCreator[]> = ReturnType<T[number]>;

type ActionFrom<T> = T extends BaseActionCreator
  ? ActionOf<T>
  : T extends BaseActionCreator[]
    ? ActionOfUnion<T>
    : Action;

export type ProcessorHandler<T extends BaseActionCreator = BaseActionCreator> =
  (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionFrom<T>;
  }) => void | Promise<void>;

export interface Processor<T extends BaseActionCreator = BaseActionCreator> {
  transform?: (params: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch;
    action: ActionFrom<T>;
  }) => unknown;
  handle?: ProcessorHandler<T>;
  actionCreator?: T | T[];
  actionPredicate?: (action: ActionFrom<T>) => boolean;
  statePredicate?: (state: RootState) => boolean;
  stateChangePredicate?: (state: RootState) => unknown;
  errorKey?: MessagePaths;
  id?: string;
  predicatesOperation?: 'AND' | 'OR';
}

export function createProcessorMiddleware() {
  const processors: Processor[] = [];

  const processorMiddleware: Middleware<{}, RootState> & {
    processors: Processor[];
  } =
    ({ getState, dispatch }) =>
    (next) =>
    (action) => {
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
          (!actionPredicate || actionPredicate(action as any))
        ) {
          const a1 = transform({
            getState,
            dispatch,
            action: a as any,
            prevState,
          });

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
                actionPredicate?.(action as any)
              : (!actionType ||
                  (Array.isArray(actionType)
                    ? actionType.some((ac) => ac.match(a))
                    : actionType.match(a))) &&
                (!statePredicate || statePredicate(getState())) &&
                (!stateChangePredicate ||
                  stateChangePredicate(getState()) !==
                    stateChangePredicate(prevState)) &&
                (!actionPredicate || actionPredicate(action as any)))
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
              promise = handle({
                getState,
                dispatch,
                action: a as ActionFrom<BaseActionCreator>,
                prevState,
              });
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
