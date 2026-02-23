import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { StringDates } from '@shared/types/common.js';
import { is } from 'typia';
import { rpcEvent, rpcResponse } from '../../rpc/model/actions.js';
import { wsStateChanged } from '../../websocket/model/actions.js';
import { trackingActions } from './actions.js';
import type {
  AccessToken,
  Device,
  Track,
  TrackedDevice,
  TrackPoint,
} from './types.js';

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

export const trackingReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    .addCase(trackingActions.delete, (state, { payload }) => ({
      ...state,
      trackedDevices: state.trackedDevices.filter(
        (td) => td.token !== payload.token,
      ),
    }))
    .addCase(setActiveModal, (state) => ({
      ...state,
      devices: [],
      accessTokens: [],
      accessTokensDeviceId: undefined,
      modifiedDeviceId: undefined,
      modifiedAccessTokenId: undefined,
      modifiedTrackedDeviceId: undefined,
    }))
    .addCase(trackingActions.setDevices, (state, { payload }) => ({
      ...state,
      devices: payload,
      accessTokens: [],
    }))
    .addCase(trackingActions.modifyDevice, (state, { payload }) => ({
      ...state,
      modifiedDeviceId: payload,
    }))
    .addCase(trackingActions.setAccessTokens, (state, { payload }) => ({
      ...state,
      accessTokens: payload,
    }))
    .addCase(trackingActions.modifyAccessToken, (state, { payload }) => ({
      ...state,
      modifiedAccessTokenId: payload,
    }))
    .addCase(trackingActions.showAccessTokens, (state, { payload }) => ({
      ...state,
      accessTokensDeviceId: payload,
    }))
    .addCase(trackingActions.setTrackedDevices, (state, { payload }) => ({
      ...state,
      trackedDevices: payload,
    }))
    .addCase(trackingActions.modifyTrackedDevice, (state, { payload }) => ({
      ...state,
      modifiedTrackedDeviceId: payload,
    }))
    .addCase(trackingActions.saveTrackedDevice, (state, { payload }) => ({
      ...state,
      trackedDevices: [
        ...state.trackedDevices.filter(
          (d) => d.token !== state.modifiedTrackedDeviceId,
        ),
        payload,
      ],
      modifiedTrackedDeviceId: undefined,
    }))
    .addCase(trackingActions.deleteTrackedDevice, (state, { payload }) => ({
      ...state,
      trackedDevices: state.trackedDevices.filter((d) => d.token !== payload),
    }))
    .addCase(trackingActions.setShowPoints, (state, { payload }) => ({
      ...state,
      showPoints: payload,
    }))
    .addCase(trackingActions.setShowLine, (state, { payload }) => ({
      ...state,
      showLine: payload,
    }))
    .addCase(wsStateChanged, (state, { payload }) =>
      payload.state === 1 ? state : { ...state, tracks: [] },
    )
    .addCase(rpcResponse, (state, action) => {
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
              token,
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
    .addCase(rpcEvent, (state, { payload: { method, params } }) => {
      if (
        method === 'tracking.addPoint' &&
        is<StringDates<TrackPoint> & { token: string }>(params)
      ) {
        const { token, ts, ...rest } = params;

        if (token === undefined) {
          return;
        }

        let track = state.tracks.find((t) => t.token === token);

        if (!track) {
          track = { token, trackPoints: [] };

          state.tracks.push(track);
        }

        track.trackPoints.push({ ts: new Date(ts), ...rest });

        // TODO apply limits from trackedDevices
      }

      return state;
    })
    .addCase(
      mapsLoaded,
      (
        state,
        {
          payload: {
            data: { tracking },
            merge,
          },
        },
      ) => {
        return {
          ...state,
          trackedDevices: [
            ...(merge ? state.trackedDevices : []),
            ...(tracking?.trackedDevices ?? initialState.trackedDevices),
          ],
          showLine: tracking?.showLine ?? initialState.showLine,
          showPoints: tracking?.showPoints ?? initialState.showPoints,
        };
      },
    ),
);
