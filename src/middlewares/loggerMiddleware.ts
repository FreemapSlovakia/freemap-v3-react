import { Middleware } from 'redux';
import { RootState } from '../store.js';

export const loggerMiddleware: Middleware<{}, RootState> =
  ({ getState }) =>
  (next) =>
  (action) => {
    console.debug('Action', action);

    const result = next(action);

    console.debug('State', getState());

    return result;
  };
