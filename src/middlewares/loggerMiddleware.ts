import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { Dispatch, Middleware } from 'redux';

export const loggerMiddleware: Middleware<
  RootAction,
  RootState,
  Dispatch<RootAction>
> = ({ getState }) => (next: Dispatch) => (action: RootAction): RootAction => {
  console.debug('Action', action); // TODO make switchable

  const result = next(action);

  console.debug('State', getState()); // TODO make switchable

  return result;
};
