import { RootAction } from 'fm3/actions';
import { sendError } from 'fm3/globalErrorHandler';
import { RootState } from 'fm3/reducers';
import { Dispatch, Middleware } from 'redux';

export const errorHandlingMiddleware: Middleware<
  RootAction | null,
  RootState,
  Dispatch<RootAction>
> = () => (next: Dispatch) =>
  function (action: RootAction): RootAction | null {
    try {
      return next(action);
    } catch (error) {
      sendError({ kind: 'reducer', error, action });

      return null;
    }
  };
