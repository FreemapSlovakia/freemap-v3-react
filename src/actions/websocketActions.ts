import { createAction } from '@reduxjs/toolkit';

export const wsOpen = createAction<unknown>('WS_OPEN');

export const wsClose = createAction<unknown>('WS_CLOSE');

export const wsSend = createAction<{
  message: unknown;
  tag?: unknown;
}>('WS_SEND');

export const wsStateChanged = createAction<{
  state: number;
  code?: number;
  timestamp: number;
}>('WS_STATE_CHANGED');

export const wsReceived = createAction<string>('WS_RECEIVED');

export const wsInvalidState = createAction<unknown>('WS_INVALID_STATE');
