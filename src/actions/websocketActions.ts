import { createAction } from 'typesafe-actions';

export const wsOpen = createAction('WS_OPEN')<unknown>();

export const wsClose = createAction('WS_CLOSE')<unknown>();

export const wsSend =
  createAction('WS_SEND')<{
    message: unknown;
    tag?: unknown;
  }>();

export const wsStateChanged =
  createAction('WS_STATE_CHANGED')<{
    state: number;
    code?: number;
    timestamp: number;
  }>();

export const wsReceived = createAction('WS_RECEIVED')<string>();

export const wsInvalidState = createAction('WS_INVALID_STATE')<unknown>();
