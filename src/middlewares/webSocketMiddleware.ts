import {
  wsInvalidState,
  wsReceived,
  wsStateChanged,
  wsOpen,
  wsSend,
  wsClose,
} from 'fm3/actions/websocketActions';
import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { getType } from 'typesafe-actions';

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

export const webSocketMiddleware: Middleware<{}, RootState, Dispatch> = ({
  dispatch,
  getState,
}) => next => (action: RootAction) => {
  switch (action.type) {
    case getType(wsOpen): {
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        dispatch(wsInvalidState(action.payload));

        return;
      }

      const { user } = getState().auth;

      ws = new WebSocket(
        `${process.env.API_URL?.replace(/^http/, 'ws')}/ws?pingInterval=30000${
          user ? `&authToken=${user.authToken}` : ''
        }`,
      );

      dispatch(wsStateChanged({ timestamp: Date.now(), state: ws.readyState }));

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

      break;
    }
    case getType(wsSend):
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(action.payload.message));
        break;
      } else {
        dispatch(wsInvalidState(action.payload.tag));
        return;
      }
    case getType(wsClose):
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close();
        break;
      } else {
        dispatch(wsInvalidState(action.payload));
        return;
      }
    default:
      break;
  }

  const { user } = getState().auth;

  const result = next(action);

  if (
    ws &&
    user !== getState().auth.user &&
    ws.readyState !== WebSocket.CLOSED
  ) {
    ws.close();
  }

  return result;
};
