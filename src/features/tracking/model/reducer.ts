import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { rpcEvent, rpcResponse } from '@features/rpc/model/actions.js';
import { wsStateChanged } from '@features/websocket/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import z from 'zod';
import { trackingActions } from './actions.js';
import {
  type AccessToken,
  type Device,
  type Track,
  type TrackedDevice,
  TrackPointSchema,
} from './types.js';

const TrackPointsSchema = z.array(TrackPointSchema);

const TrackPointWithTokenSchema = z.object({
  ...TrackPointSchema.shape,
  token: z.string(),
});

export interface TrackingState {
  devices: Device[];
  accessTokens: AccessToken[];
  accessTokensDeviceId: number | undefined;
  modifiedDeviceId: number | null | undefined;
  modifiedAccessTokenId: number | null | undefined;
  trackedDevices: TrackedDevice[];
  tracks: Track[];
  showLine: boolean;
  showPoints: boolean;
  colorizeBy: ColorizingMode | null;
}

export const trackingInitialState: TrackingState = {
  devices: [],
  accessTokens: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  trackedDevices: [],
  tracks: [],
  showLine: true,
  showPoints: true,
  colorizeBy: null,
};

export const trackingReducer = createReducer(trackingInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => trackingInitialState)
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
    .addCase(
      trackingActions.saveTrackedDevice,
      (state, { payload: { device, previousToken } }) => ({
        ...state,
        trackedDevices: [
          ...state.trackedDevices.filter(
            (d) => d.token !== previousToken && d.token !== device.token,
          ),
          device,
        ],
      }),
    )
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
    .addCase(trackingActions.setColorizeBy, (state, { payload }) => ({
      ...state,
      colorizeBy: payload,
    }))
    .addCase(wsStateChanged, (state, { payload }) =>
      payload.state === 1 ? state : { ...state, tracks: [] },
    )
    .addCase(rpcResponse, (state, action) => {
      const { payload } = action;

      const { params } = payload;

      const parsedParams = z.object({ token: z.string() }).safeParse(params);

      if (!parsedParams.success) {
        return state;
      }

      if (
        payload.method === 'tracking.subscribe' &&
        payload.type === 'result'
      ) {
        const parsedTrackPoint = TrackPointsSchema.safeParse(payload.result);

        if (parsedTrackPoint.success) {
          const { token } = parsedParams.data;

          if (token === undefined) {
            throw new Error();
          }

          return {
            ...state,
            tracks: [
              ...state.tracks.filter(({ token: id }) => id !== token),
              { token, trackPoints: parsedTrackPoint.data },
            ],
          };
        }
      }

      return payload.method === 'tracking.unsubscribe' &&
        payload.type === 'result'
        ? {
            ...state,
            tracks: state.tracks.filter(
              (track) => track.token !== parsedParams.data.token,
            ),
          }
        : state;
    })
    .addCase(rpcEvent, (state, { payload: { method, params } }) => {
      if (method === 'tracking.addPoint') {
        const parsed = TrackPointWithTokenSchema.safeParse(params);

        if (parsed.success) {
          const { token, ...rest } = parsed.data;

          let track = state.tracks.find((t) => t.token === token);

          if (!track) {
            track = { token, trackPoints: [] };

            state.tracks.push(track);
          }

          track.trackPoints.push(rest);

          // TODO apply limits from trackedDevices
        }
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
            ...(tracking?.trackedDevices ??
              trackingInitialState.trackedDevices),
          ],
          showLine: tracking?.showLine ?? trackingInitialState.showLine,
          showPoints: tracking?.showPoints ?? trackingInitialState.showPoints,
        };
      },
    ),
);
