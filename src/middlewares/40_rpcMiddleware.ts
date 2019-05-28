import * as at from 'fm3/actionTypes';
import { wsSend, rpcResponse, rpcEvent } from 'fm3/actions/websocketActions';
import { Middleware } from 'redux';

// TODO implement timeout

interface ICall {
  method: string;
  params: any;
  tag?: any;
}

const callMap = new Map<number, ICall>();
let id = 0;

const mw: Middleware = ({ dispatch, getState }) => next => action => {
  const oldState = getState().websocket.state;

  next(action);

  const { state } = getState().websocket;
  if (oldState !== state) {
    if (state !== 1) {
      const values = callMap.values();
      callMap.clear();
      for (const call of values) {
        dispatch(
          rpcResponse({
            type: 'error',
            method: call.method,
            params: call.params,
            error: { code: -31000, message: 'connection closed' },
            tag: call.tag,
          }),
        );
      }
    }
  } else if (action.type === at.RPC_CALL) {
    id += 1;

    callMap.set(id, {
      method: action.payload.method,
      params: action.payload.params,
      tag: action.payload.tag,
    });

    dispatch(
      wsSend({
        message: {
          jsonrpc: '2.0',
          id,
          method: action.payload.method,
          params: action.payload.params,
        },
      }),
    );
  } else if (action.type === at.WS_RECEIVED) {
    let object;

    try {
      object = JSON.parse(action.payload);
    } catch {
      // ignore
    }

    if (object && object.jsonrpc === '2.0') {
      if (object.method && object.id === undefined) {
        dispatch(rpcEvent({ method: object.method, params: object.params }));
      } else if (object.id !== undefined && !object.method) {
        const call = callMap.get(object.id);

        if (call) {
          callMap.delete(object.id);
          const base = {
            method: call.method,
            params: call.params,
            tag: call.tag,
          };

          dispatch(
            rpcResponse(
              'error' in object
                ? {
                    type: 'error',
                    ...base,
                    error: object.error,
                  }
                : // TODO check 'result' in object
                  {
                    type: 'result',
                    ...base,
                    result: object.result,
                  },
            ),
          );
        }
      }
    }
  }
};

export default mw;
