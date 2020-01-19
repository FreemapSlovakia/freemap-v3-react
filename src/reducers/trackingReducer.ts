import produce from 'immer';
import { createReducer } from 'typesafe-actions';
import { trackingActions } from 'fm3/actions/trackingActions';
import {
  Track,
  TrackedDevice,
  Device,
  AccessToken,
} from 'fm3/types/trackingTypes';
import { RootAction } from 'fm3/actions';
import {
  setActiveModal,
  clearMap,
  deleteFeature,
} from 'fm3/actions/mainActions';
import { wsStateChanged } from 'fm3/actions/websocketActions';
import { rpcResponse, rpcEvent } from 'fm3/actions/rpcActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';

export interface TrackingState {
  devices: Device[];
  accessTokens: AccessToken[];
  accessTokensDeviceId: number | null | undefined;
  modifiedDeviceId: number | null | undefined;
  modifiedAccessTokenId: number | null | undefined;
  modifiedTrackedDeviceId: undefined | null | number | string;
  trackedDevices: TrackedDevice[];
  tracks: Track[];
  showLine: boolean;
  showPoints: boolean;
}

const initialState: TrackingState = {
  devices: [],
  accessTokens: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  modifiedTrackedDeviceId: undefined,
  trackedDevices: [],
  tracks: [],
  showLine: true,
  showPoints: true,
};

export const trackingReducer = createReducer<TrackingState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(setActiveModal, state => ({
    ...state,
    devices: [],
    accessTokens: [],
    accessTokensDeviceId: undefined,
    modifiedDeviceId: undefined,
    modifiedAccessTokenId: undefined,
    modifiedTrackedDeviceId: undefined,
  }))
  .handleAction(trackingActions.setDevices, (state, action) => ({
    ...state,
    devices: action.payload,
    accessTokens: [],
  }))
  .handleAction(trackingActions.modifyDevice, (state, action) => ({
    ...state,
    modifiedDeviceId: action.payload,
  }))
  .handleAction(trackingActions.setAccessTokens, (state, action) => ({
    ...state,
    accessTokens: action.payload,
  }))
  .handleAction(trackingActions.modifyAccessToken, (state, action) => ({
    ...state,
    modifiedAccessTokenId: action.payload,
  }))
  .handleAction(trackingActions.showAccessTokens, (state, action) => ({
    ...state,
    accessTokensDeviceId: action.payload,
  }))
  .handleAction(trackingActions.setTrackedDevices, (state, action) => ({
    ...state,
    trackedDevices: action.payload,
  }))
  .handleAction(trackingActions.modifyTrackedDevice, (state, action) => ({
    ...state,
    modifiedTrackedDeviceId: action.payload,
  }))
  .handleAction(trackingActions.saveTrackedDevice, (state, action) => ({
    ...state,
    trackedDevices: [
      ...state.trackedDevices.filter(
        d => d.id !== state.modifiedTrackedDeviceId,
      ),
      action.payload,
    ],
    modifiedTrackedDeviceId: undefined,
  }))
  .handleAction(trackingActions.deleteTrackedDevice, (state, action) => ({
    ...state,
    trackedDevices: state.trackedDevices.filter(d => d.id !== action.payload),
  }))
  .handleAction(trackingActions.view, (state, action) =>
    produce(state, draft => {
      if (!draft.trackedDevices.find(d => d.id === action.payload)) {
        draft.trackedDevices.push({
          id: action.payload,
        });
      }
    }),
  )
  .handleAction(trackingActions.setShowPoints, (state, action) => ({
    ...state,
    showPoints: action.payload,
  }))
  .handleAction(trackingActions.setShowLine, (state, action) => ({
    ...state,
    showLine: action.payload,
  }))
  .handleAction(wsStateChanged, (state, action) =>
    action.payload.state === 1 ? state : { ...state, tracks: [] },
  )
  .handleAction(rpcResponse, (state, action) => {
    if (
      action.payload.method === 'tracking.subscribe' &&
      action.payload.type === 'result'
    ) {
      return {
        ...state,
        tracks: [
          ...state.tracks,
          {
            id: action.payload.params.token || action.payload.params.deviceId,
            trackPoints: action.payload.result.map(tp => ({
              ...tp,
              ts: new Date(tp.ts),
            })),
          },
        ],
      };
    }

    if (
      action.payload.method === 'tracking.unsubscribe' &&
      action.payload.type === 'result'
    ) {
      return {
        ...state,
        tracks: state.tracks.filter(
          track =>
            track.id !== action.payload.params.token ||
            action.payload.params.deviceId,
        ),
      };
    }

    return state;
  })
  .handleAction(rpcEvent, (state, action) => {
    if (action.payload.method === 'tracking.addPoint') {
      // rest: id, lat, lon, altitude, speed, accuracy, bearing, battery, gsmSignal, message, ts
      const { token, deviceId, ts, ...rest } = action.payload.params;
      return produce(state, draft => {
        let track = draft.tracks.find(t => t.id === token || deviceId);
        if (!track) {
          track = { id: token || deviceId, trackPoints: [] };
          draft.tracks.push(track);
        }
        track.trackPoints.push({ ts: new Date(ts), ...rest });
        // TODO apply limits from trackedDevices
      });
    }

    return state;
  })
  .handleAction(deleteFeature, (state, action) => ({
    ...state,
    trackedDevices:
      action.payload.type === 'tracking'
        ? state.trackedDevices.filter(td => td.id !== action.payload.id)
        : state.trackedDevices,
  }))
  .handleAction(mapsDataLoaded, (state, { payload: { tracking } }) => {
    return {
      ...state,
      trackedDevices: tracking?.trackedDevices ?? initialState.trackedDevices,
      showLine: tracking?.showLine ?? initialState.showLine,
      showPoints: tracking?.showPoints ?? initialState.showPoints,
    };
  });
