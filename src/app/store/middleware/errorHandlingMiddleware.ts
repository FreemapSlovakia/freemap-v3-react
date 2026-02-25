import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store.js';
import { sendError } from './globalErrorHandler.js';

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
