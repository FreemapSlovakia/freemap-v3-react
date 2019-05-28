import { ActionType } from 'typesafe-actions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  rpcResponse,
  rpcEvent,
  wsStateChanged,
} from 'fm3/actions/websocketActions';

const actions = {
  tracking: trackingActions,

  // TODO

  clearMap,
  rpcResponse,
  rpcEvent,
  wsStateChanged,
};

export type RootAction = ActionType<typeof actions>;
