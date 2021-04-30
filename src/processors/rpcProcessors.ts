import { rpcCall, rpcEvent, rpcResponse } from 'fm3/actions/rpcActions';
import { wsReceived, wsSend } from 'fm3/actions/websocketActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { is } from 'typescript-is';

// TODO implement call timeout

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id?: string | number | null;
}

interface JsonRpcResponseBase {
  jsonrpc: '2.0';
  id: string | number | null;
}

interface JsonRpcOkResponse extends JsonRpcResponseBase {
  result: unknown;
}

interface JsonRpcErrorResponse extends JsonRpcResponseBase {
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface Call {
  method: string;
  params: unknown;
  tag?: unknown;
}

const callMap = new Map<number | string, Call>();

export const rpcWsStateProcessor: Processor = {
  statePredicate: (state) => state.websocket.state !== 1,
  stateChangePredicate: (state) => state.websocket.state,
  async handle({ dispatch }) {
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
  },
};

let id = 0;

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
    let object: unknown;

    try {
      object = JSON.parse(action.payload);
    } catch {
      // ignore
    }

    if (
      is<JsonRpcRequest>(object) &&
      'method' in object /* for dev */ &&
      object.id === undefined
    ) {
      dispatch(rpcEvent({ method: object.method, params: object.params }));
    } else if (
      is<JsonRpcOkResponse | JsonRpcErrorResponse>(object) &&
      object.id !== null
    ) {
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
            is<JsonRpcErrorResponse>(object) && 'error' in object /* for dev */
              ? {
                  type: 'error',
                  ...base,
                  error: object.error,
                }
              : {
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
