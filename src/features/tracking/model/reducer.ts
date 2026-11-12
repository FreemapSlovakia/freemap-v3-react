import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { trackingActions } from './actions.js';
import type { AccessToken, Device, Track, TrackedDevice } from './types.js';

export interface TrackingState {
  devices: Device[];
  accessTokens: AccessToken[];
  accessTokensDeviceId: number | undefined;
  modifiedDeviceId: number | null | undefined;
  modifiedAccessTokenId: number | null | undefined;
  trackedDevices: TrackedDevice[];
  tracks: Track[];
}

export const trackingInitialState: TrackingState = {
  devices: [],
  accessTokens: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  trackedDevices: [],
  tracks: [],
};

/** Sets the tracked devices, dropping the tracks of devices no longer among them. */
function withTrackedDevices(
  state: TrackingState,
  trackedDevices: TrackedDevice[],
): TrackingState {
  const tokens = new Set(trackedDevices.map((td) => td.token));

  return {
    ...state,
    trackedDevices,
    tracks: state.tracks.filter((t) => tokens.has(t.token)),
  };
}

export const trackingReducer = createReducer(trackingInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => trackingInitialState)
    .addCase(trackingActions.delete, (state, { payload }) =>
      withTrackedDevices(
        state,
        state.trackedDevices.filter((td) => td.token !== payload.token),
      ),
    )
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
    .addCase(trackingActions.setTrackedDevices, (state, { payload }) =>
      withTrackedDevices(state, payload),
    )
    .addCase(
      trackingActions.saveTrackedDevice,
      (state, { payload: { device, previousToken } }) =>
        withTrackedDevices(state, [
          ...state.trackedDevices.filter(
            (d) => d.token !== previousToken && d.token !== device.token,
          ),
          device,
        ]),
    )
    .addCase(trackingActions.deleteTrackedDevice, (state, { payload }) =>
      withTrackedDevices(
        state,
        state.trackedDevices.filter((d) => d.token !== payload),
      ),
    )
    .addCase(
      trackingActions.trackHistory,
      (state, { payload: { token, trackPoints } }) => {
        const track = { token, trackPoints };

        const index = state.tracks.findIndex((t) => t.token === token);

        return {
          ...state,
          tracks:
            index === -1
              ? [...state.tracks, track]
              : state.tracks.with(index, track),
        };
      },
    )
    .addCase(
      trackingActions.trackPoints,
      (state, { payload: { token, trackPoints } }) => {
        let track = state.tracks.find((t) => t.token === token);

        if (!track) {
          track = { token, trackPoints: [] };

          state.tracks.push(track);
        }

        // A resume before the stream caught up replays points already held.
        const ids = new Set(track.trackPoints.map((p) => p.id));

        track.trackPoints.push(...trackPoints.filter((p) => !ids.has(p.id)));

        // TODO apply limits from trackedDevices
      },
    )
    .addCase(trackingActions.dropTrack, (state, { payload }) => ({
      ...state,
      tracks: state.tracks.filter((t) => t.token !== payload),
    }))
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
      ) =>
        withTrackedDevices(state, [
          ...(merge ? state.trackedDevices : []),
          ...(tracking?.trackedDevices ?? trackingInitialState.trackedDevices),
        ]),
    ),
);
