import { RootAction } from 'fm3/actions';
import {
  wsClose,
  wsInvalidState,
  wsOpen,
  wsReceived,
  wsSend,
  wsStateChanged,
} from 'fm3/actions/websocketActions';
import { DefaultRootState } from 'react-redux';
import { Dispatch, Middleware } from 'redux';
import { isActionOf } from 'typesafe-actions';

export function createWebsocketMiddleware(): Middleware<
  unknown,
  DefaultRootState,
  Dispatch
> {
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
    (next: Dispatch) =>
    (action: RootAction): unknown => {
      if (isActionOf(wsOpen, action)) {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          dispatch(wsInvalidState(action.payload));

          return;
        }

        const { user } = getState().auth;

        ws = new WebSocket(
          `${process.env['API_URL']?.replace(
            /^http/,
            'ws',
          )}/ws?pingInterval=30000${
            user ? `&authToken=${encodeURIComponent(user.authToken)}` : ''
          }`,
        );

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
      } else if (isActionOf(wsSend, action)) {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(action.payload.message));
        } else {
          dispatch(wsInvalidState(action.payload.tag));
          return;
        }
      } else if (isActionOf(wsClose, action)) {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          ws.close();
        } else {
          dispatch(wsInvalidState(action.payload));
          return;
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
