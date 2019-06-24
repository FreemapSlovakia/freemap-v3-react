import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { wsStateChanged } from 'fm3/actions/websocketActions';

export interface IWebsocketState {
  state: number;
  code?: number;
  timestamp: number;
}

const initialState: IWebsocketState = {
  state: 3,
  code: 1000,
  timestamp: 0,
};

export const websocketReducer = createReducer<IWebsocketState, RootAction>(
  initialState,
).handleAction(wsStateChanged, (_, action) => ({
  state: action.payload.state,
  code: action.payload.code,
  timestamp: action.payload.timestamp,
}));
