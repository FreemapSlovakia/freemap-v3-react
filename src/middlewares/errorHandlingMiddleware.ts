import { Middleware } from '@reduxjs/toolkit';
import { sendError } from '../globalErrorHandler.js';
import type { RootState } from '../store.js';

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
