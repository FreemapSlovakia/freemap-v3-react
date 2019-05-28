import { createStandardAction } from 'typesafe-actions';

// createStandardAction('TRACKING_SET_TRACKED_DEVICES')<
//     ITrackedDevice[]
//   >()

export const wsOpen = createStandardAction('WS_OPEN')<any>();

export const wsClose = createStandardAction('WS_CLOSE')<any>();

export const wsSend = createStandardAction('WS_SEND')<{
  message: any;
  tag?: any;
}>();

export const wsStateChanged = createStandardAction('WS_STATE_CHANGED')<{
  state: number;
  code?: number;
  timestamp: number;
}>();

export const wsReceived = createStandardAction('WS_RECEIVED')<string>();

export const wsInvalidState = createStandardAction('WS_INVALID_STATE')<any>();

// TODO to separate file
export const rpcCall = createStandardAction('RPC_CALL')<{
  method: string;
  params: any;
  tag?: any;
}>();

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

export const rpcResponse = createStandardAction('RPC_RESPONSE')<
  RpcResultResponse | RpcErrorResponse
>();

export const rpcEvent = createStandardAction('RPC_EVENT')<{
  method: string;
  params: any;
}>();
