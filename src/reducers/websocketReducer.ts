import { RootAction } from 'fm3/actions';
import { wsStateChanged } from 'fm3/actions/websocketActions';
import { createReducer } from 'typesafe-actions';

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

export const websocketReducer = createReducer<WebsocketState, RootAction>(
  initialState,
).handleAction(wsStateChanged, (_, action) => ({
  state: action.payload.state,
  code: action.payload.code,
  timestamp: action.payload.timestamp,
}));
