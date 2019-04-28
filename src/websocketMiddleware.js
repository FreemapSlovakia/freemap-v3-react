import * as at from 'fm3/actionTypes';
import { wsAlreadyOpenedOrOpening, wsOpened, wsErrored, wsClosed, wsReceived, wsNotOpened } from 'fm3/actions/websocketActions';

let ws = null;

export default ({ dispatch }) => next => (action) => {
  switch (action.type) {
    case at.WS_OPEN:
      if (ws && ws.readyState === 0) {
        ws.close();
        ws = null;
      }

      if (ws && ws.readyState < 2) {
        dispatch(wsAlreadyOpenedOrOpening());
        return;
      }

      ws = new WebSocket(`${process.env.API_URL.replace(/^http/, 'ws')}/ws`);

      ws.addEventListener('open', ({ target }) => {
        if (ws === target) {
          dispatch(wsOpened());
        } else {
          target.close();
        }
      });

      ws.addEventListener('error', ({ target }) => {
        if (ws === target) {
          // don't do that: ws = null;
          dispatch(wsErrored());
        }
      });

      ws.addEventListener('close', ({ target, code }) => {
        if (ws === target) {
          ws = null;
          dispatch(wsClosed(code));
        }
      });

      ws.addEventListener('message', ({ target, data }) => {
        const dataObj = JSON.parse(data);
        if (dataObj.type !== 'pong') {
          dispatch(wsReceived(dataObj)); // TODO handle parsing error
        }
        if (ws !== target) { // oops
          target.close();
        }
      });

      break;
    case at.WS_SEND:
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(action.payload));
      } else {
        dispatch(wsNotOpened());
        return;
      }
      break;
    case at.WS_CLOSE:
      if (ws && ws.readyState === 1) {
        ws.close();
        ws = null;
      } else {
        dispatch(wsNotOpened());
        return;
      }
      break;
    default:
      break;
  }

  next(action);
};
