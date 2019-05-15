import * as at from 'fm3/actionTypes';
import { wsInvalidState, wsStateChanged, wsReceived } from 'fm3/actions/websocketActions';

let ws = { readyState: 3 };

export default ({ dispatch }) => next => (action) => {
  switch (action.type) {
    case at.WS_OPEN:
      if (ws.readyState < 3) {
        dispatch(wsInvalidState(action.payload));
        return;
      }

      ws = new WebSocket(`${process.env.API_URL.replace(/^http/, 'ws')}/ws`);
      dispatch(wsStateChanged(ws.readyState));

      ws.addEventListener('open', ({ target }) => {
        if (ws === target) {
          dispatch(wsStateChanged(target.readyState));
        }
      });

      ws.addEventListener('close', ({ target, code }) => {
        if (ws === target) {
          dispatch(wsStateChanged(target.readyState, code));
        }
      });

      ws.addEventListener('message', ({ target, data }) => {
        if (ws === target) {
          dispatch(wsReceived(data));
        }
      });
      break;
    case at.WS_SEND:
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(action.payload.message));
      } else {
        dispatch(wsInvalidState(action.payload.tag));
        return;
      }
      break;
    case at.WS_CLOSE:
      if (ws.readyState < 3) {
        ws.close();
      } else {
        dispatch(wsInvalidState(action.payload));
        return;
      }
      break;
    default:
      break;
  }

  next(action);
};
