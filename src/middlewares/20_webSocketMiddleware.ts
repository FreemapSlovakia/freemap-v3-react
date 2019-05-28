import {
  wsInvalidState,
  wsReceived,
  wsStateChanged,
} from 'fm3/actions/websocketActions';
import * as at from 'fm3/actionTypes';

let ws: WebSocket | null = null;
let restarter;

function resetRestarter() {
  if (restarter) {
    clearTimeout(restarter);
  }
  restarter = setTimeout(() => {
    if (ws) {
      ws.close();
    }
  }, 45000);
}

// TODO move elsewhere
declare var process: {
  env: {
    API_URL: string;
  };
};

export default ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case at.WS_OPEN: {
      if (ws && ws.readyState < 3) {
        dispatch(wsInvalidState(action.payload));
        return;
      }

      const { user } = getState().auth;
      ws = new WebSocket(
        `${process.env.API_URL.replace(/^http/, 'ws')}/ws?pingInterval=30000${
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
          clearTimeout(restarter);
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
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(action.payload.message));
      } else {
        dispatch(wsInvalidState(action.payload.tag));
        return;
      }
      break;
    case at.WS_CLOSE:
      if (ws && ws.readyState < 3) {
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

  if (user !== getState().auth && ws && ws.readyState < 2) {
    ws.close();
  }
};
