import { Middleware, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

export const loggerMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ getState }) => next => (action: RootAction) => {
  console.debug('Action', action); // TODO make switchable
  next(action);
  console.debug('State', getState()); // TODO make switchable
};
