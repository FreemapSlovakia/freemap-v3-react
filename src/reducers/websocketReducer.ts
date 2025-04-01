import { createReducer } from '@reduxjs/toolkit';
import { wsStateChanged } from 'fm3/actions/websocketActions';

export interface WebsocketState {
  state: number;
  code?: number;
  timestamp: number;
}

const initialState: WebsocketState = {
  state: 3,
  code: 1000,
  timestamp: 0,
};

export const websocketReducer = createReducer(initialState, (builder) =>
  builder.addCase(wsStateChanged, (_, action) => ({
    state: action.payload.state,
    code: action.payload.code,
    timestamp: action.payload.timestamp,
  })),
);
