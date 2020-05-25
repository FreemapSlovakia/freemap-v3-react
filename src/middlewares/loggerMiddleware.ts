import { Middleware, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

export const loggerMiddleware: Middleware<
  any,
  RootState,
  Dispatch<RootAction>
> = ({ getState }) => (next: Dispatch) => (action: RootAction): any => {
  console.debug('Action', action); // TODO make switchable
  const result = next(action);
  console.debug('State', getState()); // TODO make switchable
  return result;
};
