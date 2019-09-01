import { createStandardAction } from 'typesafe-actions';

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
