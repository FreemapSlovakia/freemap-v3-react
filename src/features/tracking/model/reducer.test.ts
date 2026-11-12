import { setActiveModal } from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import { trackingActions } from './actions.js';
import { trackingReducer } from './reducer.js';
import type { Track, TrackedDevice, TrackPoint } from './types.js';

const td = (token: string, extra?: Partial<TrackedDevice>): TrackedDevice => ({
  token,
  ...extra,
});

const point = (id: number): TrackPoint => ({
  id,
  lat: 1,
  lon: 2,
  ts: new Date('2024-01-01T00:00:00.000Z'),
});

const withTracks = (tracks: Track[]) => ({
  devices: [],
  accessTokens: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  trackedDevices: [],
  tracks,
});

describe('trackingReducer — tracked devices', () => {
  it('saveTrackedDevice replaces the edited device, re-appending it', () => {
    const state = {
      ...withTracks([]),
      trackedDevices: [td('a', { label: 'old' }), td('b')],
    };

    const next = trackingReducer(
      state,
      trackingActions.saveTrackedDevice({
        device: td('a', { label: 'new' }),
        previousToken: 'a',
      }),
    );

    // 'a' is removed then re-appended at the end with the new label.
    expect(next.trackedDevices.map((d) => d.token)).toEqual(['b', 'a']);
    expect(next.trackedDevices.at(-1)?.label).toBe('new');
  });

  it('saveTrackedDevice with no previous token just appends', () => {
    const state = { ...withTracks([]), trackedDevices: [td('a')] };

    const next = trackingReducer(
      state,
      trackingActions.saveTrackedDevice({
        device: td('b'),
        previousToken: null,
      }),
    );

    expect(next.trackedDevices.map((d) => d.token)).toEqual(['a', 'b']);
  });

  it('saveTrackedDevice with a renamed token drops the old entry', () => {
    const state = {
      ...withTracks([]),
      trackedDevices: [td('a'), td('b')],
    };

    const next = trackingReducer(
      state,
      trackingActions.saveTrackedDevice({
        device: td('c'),
        previousToken: 'a',
      }),
    );

    expect(next.trackedDevices.map((d) => d.token)).toEqual(['b', 'c']);
  });

  it('deleteTrackedDevice removes by token', () => {
    const state = {
      ...withTracks([]),
      trackedDevices: [td('a'), td('b')],
    };

    const next = trackingReducer(
      state,
      trackingActions.deleteTrackedDevice('a'),
    );

    expect(next.trackedDevices.map((d) => d.token)).toEqual(['b']);
  });

  it('delete removes the tracked device matching the token', () => {
    const state = {
      ...withTracks([]),
      trackedDevices: [td('a'), td('b')],
    };

    const next = trackingReducer(state, trackingActions.delete({ token: 'b' }));

    expect(next.trackedDevices.map((d) => d.token)).toEqual(['a']);
  });
});

describe('trackingReducer — device editor state', () => {
  it('setDevices stores devices and clears access tokens', () => {
    const state = { ...withTracks([]), accessTokens: [{ id: 1 }] as never };

    const next = trackingReducer(
      state,
      trackingActions.setDevices([{ id: 9 }] as never),
    );

    expect(next.devices).toEqual([{ id: 9 }]);
    expect(next.accessTokens).toEqual([]);
  });

  it('setActiveModal clears the device/token editor fields', () => {
    const state = {
      ...withTracks([]),
      devices: [{ id: 1 }] as never,
      modifiedDeviceId: 5,
      accessTokensDeviceId: 3,
    };

    const next = trackingReducer(state, setActiveModal(null));

    expect(next.devices).toEqual([]);
    expect(next.modifiedDeviceId).toBeUndefined();
    expect(next.accessTokensDeviceId).toBeUndefined();
  });
});

describe('trackingReducer — stream history', () => {
  it('replaces the track for that token', () => {
    const state = withTracks([{ token: 'a', trackPoints: [point(9)] }]);

    const next = trackingReducer(
      state,
      trackingActions.trackHistory({
        token: 'a',
        trackPoints: [point(1), point(2)],
      }),
    );

    expect(next.tracks).toHaveLength(1);
    expect(next.tracks[0].trackPoints.map((p) => p.id)).toEqual([1, 2]);
  });

  it('an empty history empties the track', () => {
    const state = withTracks([{ token: 'a', trackPoints: [point(9)] }]);

    const next = trackingReducer(
      state,
      trackingActions.trackHistory({ token: 'a', trackPoints: [] }),
    );

    expect(next.tracks[0].trackPoints).toEqual([]);
  });

  it('keeps the track in its place', () => {
    const state = withTracks([
      { token: 'a', trackPoints: [] },
      { token: 'b', trackPoints: [] },
    ]);

    const next = trackingReducer(
      state,
      trackingActions.trackHistory({ token: 'a', trackPoints: [point(1)] }),
    );

    expect(next.tracks.map((t) => t.token)).toEqual(['a', 'b']);
  });
});

describe('trackingReducer — stream points', () => {
  it('appends to an existing track in arrival order', () => {
    const state = withTracks([{ token: 'a', trackPoints: [point(5)] }]);

    const next = trackingReducer(
      state,
      trackingActions.trackPoints({
        token: 'a',
        trackPoints: [point(3), point(7)],
      }),
    );

    expect(next.tracks[0].trackPoints.map((p) => p.id)).toEqual([5, 3, 7]);
  });

  it('creates a track when none exists for the token', () => {
    const next = trackingReducer(
      withTracks([]),
      trackingActions.trackPoints({ token: 'z', trackPoints: [point(5)] }),
    );

    expect(next.tracks).toHaveLength(1);
    expect(next.tracks[0].token).toBe('z');
  });

  it('ignores points it already holds', () => {
    const state = withTracks([{ token: 'a', trackPoints: [point(1)] }]);

    const next = trackingReducer(
      state,
      trackingActions.trackPoints({
        token: 'a',
        trackPoints: [point(1), point(2)],
      }),
    );

    expect(next.tracks[0].trackPoints.map((p) => p.id)).toEqual([1, 2]);
  });

  it('dropTrack removes the track', () => {
    const state = withTracks([
      { token: 'a', trackPoints: [] },
      { token: 'b', trackPoints: [] },
    ]);

    const next = trackingReducer(state, trackingActions.dropTrack('a'));

    expect(next.tracks.map((t) => t.token)).toEqual(['b']);
  });
});

describe('trackingReducer — tracks follow the tracked devices', () => {
  it('deleteTrackedDevice drops its track', () => {
    const state = {
      ...withTracks([
        { token: 'a', trackPoints: [] },
        { token: 'b', trackPoints: [] },
      ]),
      trackedDevices: [td('a'), td('b')],
    };

    const next = trackingReducer(
      state,
      trackingActions.deleteTrackedDevice('a'),
    );

    expect(next.tracks.map((t) => t.token)).toEqual(['b']);
  });

  it('a renamed token drops the old track', () => {
    const state = {
      ...withTracks([{ token: 'a', trackPoints: [] }]),
      trackedDevices: [td('a')],
    };

    const next = trackingReducer(
      state,
      trackingActions.saveTrackedDevice({
        device: td('b'),
        previousToken: 'a',
      }),
    );

    expect(next.tracks).toEqual([]);
  });
});
