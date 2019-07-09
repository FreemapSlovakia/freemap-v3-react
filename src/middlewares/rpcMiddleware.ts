import {
  wsSend,
  rpcResponse,
  rpcEvent,
  rpcCall,
  wsReceived,
} from 'fm3/actions/websocketActions';
import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { isActionOf } from 'typesafe-actions';

// TODO implement timeout

interface ICall {
  method: string;
  params: any;
  tag?: any;
}

const callMap = new Map<number, ICall>();
let id = 0;

export const rpcMiddleware: Middleware<{}, RootState, Dispatch<RootAction>> = ({
  dispatch,
  getState,
}) => next => (action: RootAction) => {
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
  } else if (isActionOf(rpcCall, action)) {
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
  } else if (isActionOf(wsReceived, action)) {
    let object: any;

    try {
      object = JSON.parse(action.payload);
    } catch {
      // ignore
    }

    if (object && typeof object === 'object' && object.jsonrpc === '2.0') {
      if (typeof object.method === 'string' && object.id === undefined) {
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
