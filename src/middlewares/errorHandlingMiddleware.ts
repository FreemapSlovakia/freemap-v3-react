import { sendError } from 'fm3/globalErrorHandler';
import { RootState } from 'fm3/store';
import { Middleware } from '@reduxjs/toolkit';

export const errorHandlingMiddleware: Middleware<{}, RootState> =
  () => (next) =>
    function (action) {
      try {
        return next(action);
      } catch (error) {
        sendError({ kind: 'reducer', error, action });

        return null;
      }
    };
