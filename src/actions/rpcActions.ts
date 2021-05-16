import { createAction } from 'typesafe-actions';

interface RpcResponseBase {
  method: string;
  params: unknown;
  tag?: unknown;
}

export interface RpcResultResponse extends RpcResponseBase {
  type: 'result';
  result: unknown;
}

export interface RpcErrorResponse extends RpcResponseBase {
  type: 'error';
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export const rpcCall =
  createAction('RPC_CALL')<{
    method: string;
    params: unknown;
    tag?: unknown;
  }>();

export const rpcResponse =
  createAction('RPC_RESPONSE')<RpcResultResponse | RpcErrorResponse>();

export const rpcEvent =
  createAction('RPC_EVENT')<{
    method: string;
    params: unknown;
  }>();
