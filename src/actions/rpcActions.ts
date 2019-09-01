import { createStandardAction } from 'typesafe-actions';

interface RpcResponse {
  method: string;
  params: any;
  tag?: any;
}

interface RpcResultResponse extends RpcResponse {
  type: 'result';
  result: any;
}

interface RpcErrorResponse extends RpcResponse {
  type: 'error';
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export const rpcCall = createStandardAction('RPC_CALL')<{
  method: string;
  params: any;
  tag?: any;
}>();

export const rpcResponse = createStandardAction('RPC_RESPONSE')<
  RpcResultResponse | RpcErrorResponse
>();

export const rpcEvent = createStandardAction('RPC_EVENT')<{
  method: string;
  params: any;
}>();
