import { createAction } from 'typesafe-actions';

export const wsOpen = createAction('WS_OPEN')<any>();

export const wsClose = createAction('WS_CLOSE')<any>();

export const wsSend = createAction('WS_SEND')<{
  message: any;
  tag?: any;
}>();

export const wsStateChanged = createAction('WS_STATE_CHANGED')<{
  state: number;
  code?: number;
  timestamp: number;
}>();

export const wsReceived = createAction('WS_RECEIVED')<string>();

export const wsInvalidState = createAction('WS_INVALID_STATE')<any>();
