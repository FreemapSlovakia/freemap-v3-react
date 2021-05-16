import { RootAction } from 'fm3/actions';
import { DefaultRootState } from 'react-redux';
import { Dispatch, Middleware } from 'redux';

export const loggerMiddleware: Middleware<
  RootAction,
  DefaultRootState,
  Dispatch<RootAction>
> =
  ({ getState }) =>
  (next: Dispatch) =>
  (action: RootAction): RootAction => {
    console.debug('Action', action); // TODO make switchable

    const result = next(action);

    console.debug('State', getState()); // TODO make switchable

    return result;
  };
