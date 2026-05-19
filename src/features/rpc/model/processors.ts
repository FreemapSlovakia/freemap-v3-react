import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { wsReceived, wsSend } from '@features/websocket/model/actions.js';
import z from 'zod';
import { rpcCall, rpcEvent, rpcResponse } from './actions.js';

// TODO implement call timeout

const JsonRpcIdSchema = z.union([z.string(), z.number(), z.null()]);

const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.unknown().optional(),
  id: JsonRpcIdSchema.optional(),
});

const JsonRpcErrorPayloadSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional(),
});

const JsonRpcOkResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: JsonRpcIdSchema.optional(),
  result: z.unknown(),
});

const JsonRpcErrorResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: JsonRpcIdSchema.optional(),
  error: JsonRpcErrorPayloadSchema,
});

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

    const reqParse = JsonRpcRequestSchema.safeParse(object);

    if (reqParse.success && reqParse.data.id === undefined) {
      dispatch(
        rpcEvent({
          method: reqParse.data.method,
          params: reqParse.data.params,
        }),
      );

      return;
    }

    const errParse = JsonRpcErrorResponseSchema.safeParse(object);

    if (errParse.success && errParse.data.id == null) {
      dispatch(
        toastsAdd({
          style: 'danger',
          messageKey: 'general.operationError',
          messageParams: { err: errParse.data.error.message },
        }),
      );

      return;
    }

    const okParse = JsonRpcOkResponseSchema.safeParse(object);

    const respId = errParse.success
      ? errParse.data.id
      : okParse.success
        ? okParse.data.id
        : undefined;

    if (respId == null) {
      console.warn('Unexpected:', object);

      return;
    }

    const call = callMap.get(respId);

    if (!call) {
      dispatch(
        toastsAdd({
          style: 'danger',
          messageKey: 'general.operationError',
          messageParams: { err: 'No such call.' },
        }),
      );

      return;
    }

    callMap.delete(respId);

    const base = {
      method: call.method,
      params: call.params,
      tag: call.tag,
    };

    dispatch(
      rpcResponse(
        errParse.success
          ? {
              type: 'error',
              ...base,
              error: errParse.data.error,
            }
          : {
              type: 'result',
              ...base,
              result: okParse.success ? okParse.data.result : undefined,
            },
      ),
    );
  },
};
