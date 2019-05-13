import * as at from 'fm3/actionTypes';
import { wsSend } from 'fm3/actions/websocketActions';

const callMap = new Map();
let id = 0;

export default ({ dispatch }) => next => (action) => {
  next(action);

  if (action.type === at.RPC_CALL) {
    id += 1;

    callMap.put(id, {
      successAction: action.payload.successAction,
      errorAction: action.payload.errorAction,
      resultKey: action.payload.resultKey,
      errorKey: action.payload.errorKey,
    });

    dispatch(wsSend({
      jsonrpc: '2.0',
      id,
      method: action.payload.method,
      params: action.payload.params,
    }));
  } else if (action.type === at.WS_RECEIVED) {
    let response;

    try {
      response = JSON.parse(action.payload);
    } catch {
      // ignore
    }

    if (response && response.jsonrpc === '2.0') {
      if (response.id && !response.method) {
        const call = callMap.get(id);
        callMap.delete(id);

        if (!call) {
          // ignore
        } else if (response.error) {
          if (call.errorAction) {
            const a = { ...call.errorAction };
            if (call.errorKey) {
              if (!a.payload) {
                a.payload = {};
              }
              a.payload[call.errorKey] = response.error; // { code, message, data }
            } else {
              a.payload = response.error;
            }

            dispatch(a);
          }
        } else if (call.successAction) {
          const a = { ...call.successAction };
          if (!response.result) {
            // nothing
          } else if (call.resultKey) {
            if (!a.payload) {
              a.payload = {};
            }
            a.payload[call.resultKey] = response.result;
          } else {
            a.payload = response.result;
          }

          dispatch(a);
        }
      }
    }
  }
};
