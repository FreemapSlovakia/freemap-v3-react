import { createAction } from '@reduxjs/toolkit';

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

export const rpcCall = createAction<{
  method: string;
  params: unknown;
  tag?: unknown;
}>('RPC_CALL');

export const rpcResponse = createAction<RpcResultResponse | RpcErrorResponse>(
  'RPC_RESPONSE',
);

export const rpcEvent = createAction<{
  method: string;
  params: unknown;
}>('RPC_EVENT');
