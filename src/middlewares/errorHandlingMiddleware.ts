import * as at from 'fm3/actionTypes';
import { sendError } from 'fm3/globalErrorHandler';
import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

export const errorHandlingMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = () => next => action => {
  try {
    if (action.type === at.UNHANDLED_LOGIC_ERROR) {
      sendError({ kind: 'unhandledLogic', error: action.payload });
      return null;
    }

    return next(action);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    sendError({ kind: 'reducer', error, action });
    return null;
  }
};
