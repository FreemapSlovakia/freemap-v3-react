import { RootAction } from 'fm3/actions';
import { clearMap, setActiveModal } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import { rpcEvent, rpcResponse } from 'fm3/actions/rpcActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { wsStateChanged } from 'fm3/actions/websocketActions';
import { StringDates } from 'fm3/types/common';
import {
  AccessToken,
  Device,
  Track,
  TrackedDevice,
  TrackPoint,
} from 'fm3/types/trackingTypes';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';
import { is } from 'typescript-is';

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

type HasTokenOrDeviceId =
  | { token: string; deviceId: undefined }
  | { token: undefined; deviceId: number };

export const trackingReducer = createReducer<TrackingState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(setActiveModal, (state) => ({
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
        (d) => d.id !== state.modifiedTrackedDeviceId,
      ),
      action.payload,
    ],
    modifiedTrackedDeviceId: undefined,
  }))
  .handleAction(trackingActions.deleteTrackedDevice, (state, action) => ({
    ...state,
    trackedDevices: state.trackedDevices.filter((d) => d.id !== action.payload),
  }))
  .handleAction(trackingActions.view, (state, action) =>
    produce(state, (draft) => {
      if (!draft.trackedDevices.find((d) => d.id === action.payload)) {
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
    const { payload } = action;

    const { params } = payload;

    if (!is<HasTokenOrDeviceId>(params)) {
      return state;
    }

    if (
      payload.method === 'tracking.subscribe' &&
      payload.type === 'result' &&
      is<StringDates<TrackPoint[]>>(payload.result)
    ) {
      const tid = params.token || params.deviceId;

      if (tid === undefined) {
        throw new Error();
      }

      return {
        ...state,
        tracks: [
          ...state.tracks.filter(({ id }) => id !== tid),
          {
            id: tid,
            trackPoints: payload.result.map((tp) => ({
              ...tp,
              ts: new Date(tp.ts),
            })),
          },
        ],
      };
    }

    if (
      payload.method === 'tracking.unsubscribe' &&
      payload.type === 'result'
    ) {
      return {
        ...state,
        tracks: state.tracks.filter(
          (track) => track.id !== params.token || params.deviceId,
        ),
      };
    }

    return state;
  })
  .handleAction(rpcEvent, (state, action) => {
    if (
      action.payload.method === 'tracking.addPoint' &&
      is<TrackPoint & HasTokenOrDeviceId>(action.payload.params)
    ) {
      const { token, deviceId, ts, ...rest } = action.payload.params;

      return produce(state, (draft) => {
        const key = token || deviceId;

        if (key === undefined) {
          return;
        }

        let track = draft.tracks.find((t) => t.id === key);

        if (!track) {
          track = { id: key, trackPoints: [] };

          draft.tracks.push(track);
        }

        track.trackPoints.push({ ts: new Date(ts), ...rest });

        // TODO apply limits from trackedDevices
      });
    }

    return state;
  })
  .handleAction(mapsDataLoaded, (state, { payload: { tracking } }) => {
    return {
      ...state,
      trackedDevices: tracking?.trackedDevices ?? initialState.trackedDevices,
      showLine: tracking?.showLine ?? initialState.showLine,
      showPoints: tracking?.showPoints ?? initialState.showPoints,
    };
  });
