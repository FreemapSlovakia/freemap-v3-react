import {
  wsInvalidState,
  wsReceived,
  wsStateChanged,
} from 'fm3/actions/websocketActions';
import * as at from 'fm3/actionTypes';
import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

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

export const webSocketMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case at.WS_OPEN: {
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        dispatch(wsInvalidState(action.payload));
        return;
      }

      const { user } = getState().auth;
      ws = new WebSocket(
        `${process.env.API_URL!.replace(/^http/, 'ws')}/ws?pingInterval=30000${
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
    case at.WS_SEND:
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(action.payload.message));
      } else {
        dispatch(wsInvalidState(action.payload.tag));
        return;
      }
      break;
    case at.WS_CLOSE:
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      } else {
        dispatch(wsInvalidState(action.payload));
        return;
      }
      break;
    default:
      break;
  }

  const user = getState().auth;

  next(action);

  if (user !== getState().auth && ws && ws.readyState !== WebSocket.CLOSED) {
    ws.close();
  }
};
