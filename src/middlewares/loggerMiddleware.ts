import { RootState } from 'fm3/store';
import { Middleware } from 'redux';

export const loggerMiddleware: Middleware<{}, RootState> =
  ({ getState }) =>
  (next) =>
  (action) => {
    console.debug('Action', action);

    const result = next(action);

    console.debug('State', getState());

    return result;
  };
