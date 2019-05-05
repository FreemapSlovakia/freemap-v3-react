import * as at from 'fm3/actionTypes';
import { wsAlreadyOpenedOrOpening, wsOpened, wsErrored, wsClosed, wsNotOpened } from 'fm3/actions/websocketActions';

let ws = null;

let counter = 1;
const responseMap = new Map();

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
        const rsp = responseMap.get(dataObj.id);
        if (rsp) {
          responseMap.delete(dataObj.id);
          const {
            errorAction = { type: at.WS_RPC_ERROR },
            successAction = { type: at.WS_RPC_SUCCESS },
            resultKey,
            errorKey,
          } = rsp;

          let action;

          if (dataObj.error) {
            dispatch({
              ...errorAction,
              payload: errorKey ? {
                ...(errorAction.payload || {}),
                [errorKey]: dataObj.error,
              } : dataObj.error,
            });
          } else {
            dispatch({
              ...successAction,
              payload: resultKey ? {
                ...(successAction.payload || {}),
                [resultKey]: dataObj.result,
              } : dataObj.result,
            });
          }
        }

        if (ws !== target) { // oops
          target.close();
        }
      });

      break;
    case at.WS_SEND:
      if (ws && ws.readyState === 1) {
        const id = counter;
        counter += 1;
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: action.payload.method,
          params: action.payload.params,
        }));
        responseMap.set(id, {
          successAction: action.payload.successAction,
          errorAction: action.payload.errorAction,
          resultKey: action.payload.resultKey,
          errorKey: action.payload.errorKey,
        });
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
