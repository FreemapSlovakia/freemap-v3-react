import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store/store.js';
import {
  wsClose,
  wsInvalidState,
  wsOpen,
  wsReceived,
  wsSend,
  wsStateChanged,
} from './actions.js';

export function createWebsocketMiddleware(): Middleware<{}, RootState> {
  let ws: WebSocket | null = null;

  let restarter: number | null = null;

  function resetRestarter() {
    if (restarter) {
      clearTimeout(restarter);
    }

    restarter = window.setTimeout(() => {
      if (ws) {
        ws.close();
      }
    }, 45000);
  }

  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (wsOpen.match(action)) {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          dispatch(wsInvalidState(action.payload));

          return undefined;
        }

        const { user } = getState().auth;

        const url = process.env['API_URL']?.replace(/^http/, 'ws');

        const authTokenQ = user
          ? `&authToken=${encodeURIComponent(user.authToken)}`
          : '';

        ws = new WebSocket(url + '/ws?pingInterval=30000' + authTokenQ);

        dispatch(
          wsStateChanged({ timestamp: Date.now(), state: ws.readyState }),
        );

        ws.addEventListener('open', ({ target }) => {
          if (ws === target) {
            resetRestarter();

            dispatch(
              wsStateChanged({
                timestamp: Date.now(),
                state: (target as WebSocket).readyState,
              }),
            );
          }
        });

        ws.addEventListener('close', ({ target, code }) => {
          if (ws === target) {
            if (restarter !== null) {
              window.clearTimeout(restarter);
            }

            restarter = null;

            dispatch(
              wsStateChanged({
                timestamp: Date.now(),
                state: (target as WebSocket).readyState,
                code,
              }),
            );
          }
        });

        ws.addEventListener('message', ({ target, data }) => {
          if (ws === target) {
            resetRestarter();

            if (data !== 'ping') {
              dispatch(wsReceived(data));
            }
          }
        });
      } else if (wsSend.match(action)) {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(action.payload.message));
        } else {
          dispatch(wsInvalidState(action.payload.tag));

          return undefined;
        }
      } else if (wsClose.match(action)) {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          ws.close();
        } else {
          dispatch(wsInvalidState(action.payload));

          return undefined;
        }
      }

      const { user } = getState().auth;

      const result = next(action);

      if (
        ws &&
        user?.id !== getState().auth.user?.id &&
        ws.readyState !== WebSocket.CLOSED
      ) {
        ws.close();
      }

      return result;
    };
}
