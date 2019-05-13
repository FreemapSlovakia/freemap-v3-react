import * as at from 'fm3/actionTypes';
import { sendError } from 'fm3/globalErrorHandler';

export default () => next => (action) => {
  try {
    if (action.type === at.UNHANDLED_LOGIC_ERROR) {
      sendError({ kind: 'unhandledLogic', error: action.payload });
      return null;
    }

    return next(action);
  } catch (error) {
    sendError({ kind: 'reducer', error, action });
    return null;
  }
};
