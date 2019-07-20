import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { isActionOf, ActionCreator, ActionType } from 'typesafe-actions';

export interface IProcessor<T extends ActionCreator = ActionCreator> {
  handle: (store: {
    prevState: RootState;
    getState: () => RootState;
    dispatch: Dispatch<RootAction>;
    action: ActionType<T>;
  }) => void;
  actionCreator: T | '*';
}

export const processors: IProcessor[] = [];

export const processorMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ getState, dispatch }) => next => (action: RootAction) => {
  const prevState = getState();
  const result = next(action);

  if (typeof action == 'object' && action && typeof action.type == 'string') {
    for (const { actionCreator: actionType, handle } of processors) {
      if (actionType === '*' || isActionOf(actionType, action)) {
        handle({ getState, dispatch, action, prevState });
      }
    }
  }

  return result;
};
