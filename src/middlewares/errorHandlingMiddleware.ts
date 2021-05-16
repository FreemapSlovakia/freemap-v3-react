import { RootAction } from 'fm3/actions';
import { sendError } from 'fm3/globalErrorHandler';
import { DefaultRootState } from 'react-redux';
import { Dispatch, Middleware } from 'redux';

export const errorHandlingMiddleware: Middleware<
  RootAction | null,
  DefaultRootState,
  Dispatch<RootAction>
> =
  () =>
  (next: Dispatch) =>
  (action: RootAction): RootAction | null => {
    try {
      return next(action);
    } catch (error) {
      sendError({ kind: 'reducer', error, action });

      return null;
    }
  };
