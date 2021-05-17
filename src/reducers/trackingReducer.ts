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
  accessTokensDeviceId: number | undefined;
  modifiedDeviceId: number | null | undefined;
  modifiedAccessTokenId: number | null | undefined;
  modifiedTrackedDeviceId: undefined | null | string;
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
  .handleAction(setActiveModal, (state) => ({
    ...state,
    devices: [],
    accessTokens: [],
    accessTokensDeviceId: undefined,
    modifiedDeviceId: undefined,
    modifiedAccessTokenId: undefined,
    modifiedTrackedDeviceId: undefined,
  }))
  .handleAction(trackingActions.setDevices, (state, { payload }) => ({
    ...state,
    devices: payload,
    accessTokens: [],
  }))
  .handleAction(trackingActions.modifyDevice, (state, { payload }) => ({
    ...state,
    modifiedDeviceId: payload,
  }))
  .handleAction(trackingActions.setAccessTokens, (state, { payload }) => ({
    ...state,
    accessTokens: payload,
  }))
  .handleAction(trackingActions.modifyAccessToken, (state, { payload }) => ({
    ...state,
    modifiedAccessTokenId: payload,
  }))
  .handleAction(trackingActions.showAccessTokens, (state, { payload }) => ({
    ...state,
    accessTokensDeviceId: payload,
  }))
  .handleAction(trackingActions.setTrackedDevices, (state, { payload }) => ({
    ...state,
    trackedDevices: payload,
  }))
  .handleAction(trackingActions.modifyTrackedDevice, (state, { payload }) => ({
    ...state,
    modifiedTrackedDeviceId: payload,
  }))
  .handleAction(trackingActions.saveTrackedDevice, (state, { payload }) => ({
    ...state,
    trackedDevices: [
      ...state.trackedDevices.filter(
        (d) => d.token !== state.modifiedTrackedDeviceId,
      ),
      payload,
    ],
    modifiedTrackedDeviceId: undefined,
  }))
  .handleAction(trackingActions.deleteTrackedDevice, (state, { payload }) => ({
    ...state,
    trackedDevices: state.trackedDevices.filter((d) => d.token !== payload),
  }))
  .handleAction(trackingActions.setShowPoints, (state, { payload }) => ({
    ...state,
    showPoints: payload,
  }))
  .handleAction(trackingActions.setShowLine, (state, { payload }) => ({
    ...state,
    showLine: payload,
  }))
  .handleAction(wsStateChanged, (state, { payload }) =>
    payload.state === 1 ? state : { ...state, tracks: [] },
  )
  .handleAction(rpcResponse, (state, action) => {
    const { payload } = action;

    const { params } = payload;

    if (!is<{ token: string }>(params)) {
      return state;
    }

    if (
      payload.method === 'tracking.subscribe' &&
      payload.type === 'result' &&
      is<StringDates<TrackPoint[]>>(payload.result)
    ) {
      const { token } = params;

      if (token === undefined) {
        throw new Error();
      }

      return {
        ...state,
        tracks: [
          ...state.tracks.filter(({ token: id }) => id !== token),
          {
            token: token,
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
        tracks: state.tracks.filter((track) => track.token !== params.token),
      };
    }

    return state;
  })
  .handleAction(rpcEvent, (state, { payload: { method, params } }) => {
    if (
      method === 'tracking.addPoint' &&
      is<TrackPoint & { token: string }>(params)
    ) {
      const { token, ts, ...rest } = params;

      return produce(state, (draft) => {
        if (token === undefined) {
          return;
        }

        let track = draft.tracks.find((t) => t.token === token);

        if (!track) {
          track = { token, trackPoints: [] };

          draft.tracks.push(track);
        }

        track.trackPoints.push({ ts: new Date(ts), ...rest });

        // TODO apply limits from trackedDevices
      });
    }

    return state;
  })
  .handleAction(mapsDataLoaded, (state, { payload: { tracking, merge } }) => {
    return {
      ...state,
      trackedDevices: [
        ...(merge ? state.trackedDevices : []),
        ...(tracking?.trackedDevices ?? initialState.trackedDevices),
      ],
      showLine: tracking?.showLine ?? initialState.showLine,
      showPoints: tracking?.showPoints ?? initialState.showPoints,
    };
  });
