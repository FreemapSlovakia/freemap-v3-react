import { wsSend, wsReceived } from 'fm3/actions/websocketActions';
import { rpcResponse, rpcEvent, rpcCall } from 'fm3/actions/rpcActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

// TODO implement call timeout

interface Call {
  method: string;
  params: any;
  tag?: any;
}

const callMap = new Map<number, Call>();
let id = 0;

export const rpcWsStateProcessor: Processor = {
  actionCreator: '*',
  handle: async ({ dispatch, getState, prevState }) => {
    const oldState = prevState.websocket.state;

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
    }
  },
};

export const rpcCallProcessor: Processor<typeof rpcCall> = {
  actionCreator: rpcCall,
  handle: async ({ dispatch, action }) => {
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
  },
};

export const wsReceivedProcessor: Processor<typeof wsReceived> = {
  actionCreator: wsReceived,
  handle: async ({ dispatch, action }) => {
    let object: any;

    try {
      object = JSON.parse(action.payload);
    } catch {
      // ignore
    }

    if (!object || typeof object !== 'object' || object.jsonrpc !== '2.0') {
      // nothing
    } else if (typeof object.method === 'string' && object.id === undefined) {
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
  },
};
