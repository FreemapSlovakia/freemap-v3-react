import { setActiveModal } from '@app/store/actions.js';
import { rpcEvent, rpcResponse } from '@features/rpc/model/actions.js';
import { wsStateChanged } from '@features/websocket/model/actions.js';
import { describe, expect, it } from 'vitest';
import { trackingActions } from './actions.js';
import { trackingReducer } from './reducer.js';
import type { Track, TrackedDevice } from './types.js';

/**
 * Pure reducer tests for the tracking slice. The RPC paths validate their
 * params with zod before touching state, so the tests pass well-formed
 * payloads (ISO `ts`, string `token`).
 */

const td = (token: string, extra?: Partial<TrackedDevice>): TrackedDevice => ({
  token,
  ...extra,
});

// A websocket track-point param as it arrives over RPC (ISO date string).
const rpcPoint = (id: number) => ({
  id,
  lat: 1,
  lon: 2,
  ts: '2024-01-01T00:00:00.000Z',
});

const withTracks = (tracks: Track[]) => ({
  devices: [],
  accessTokens: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  modifiedTrackedDevice: undefined,
  trackedDevices: [],
  tracks,
  showLine: true,
  showPoints: true,
  colorizeBy: null,
});

describe('trackingReducer — tracked devices', () => {
  it('saveTrackedDevice replaces the one being edited and clears the editor', () => {
    const state = {
      ...withTracks([]),
      trackedDevices: [td('a', { label: 'old' }), td('b')],
      modifiedTrackedDevice: td('a'),
    };

    const next = trackingReducer(
      state,
      trackingActions.saveTrackedDevice(td('a', { label: 'new' })),
    );

    // 'a' is removed then re-appended at the end with the new label.
    expect(next.trackedDevices.map((d) => d.token)).toEqual(['b', 'a']);
    expect(next.trackedDevices.at(-1)?.label).toBe('new');
    expect(next.modifiedTrackedDevice).toBeUndefined();
  });

  it('saveTrackedDevice with no editor target just appends', () => {
    const state = { ...withTracks([]), trackedDevices: [td('a')] };

    const next = trackingReducer(
      state,
      trackingActions.saveTrackedDevice(td('b')),
    );

    expect(next.trackedDevices.map((d) => d.token)).toEqual(['a', 'b']);
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

  it('setShowPoints / setShowLine store the flags', () => {
    const off = trackingReducer(
      withTracks([]),
      trackingActions.setShowPoints(false),
    );
    expect(off.showPoints).toBe(false);

    const line = trackingReducer(
      withTracks([]),
      trackingActions.setShowLine(false),
    );
    expect(line.showLine).toBe(false);
  });
});

describe('trackingReducer — websocket lifecycle', () => {
  it('keeps tracks while the socket is open (state 1)', () => {
    const state = withTracks([{ token: 'a', trackPoints: [] }]);

    const next = trackingReducer(
      state,
      wsStateChanged({ state: 1, timestamp: 0 }),
    );

    expect(next.tracks).toHaveLength(1);
  });

  it('clears tracks when the socket is not open', () => {
    const state = withTracks([{ token: 'a', trackPoints: [] }]);

    const next = trackingReducer(
      state,
      wsStateChanged({ state: 3, timestamp: 0 }),
    );

    expect(next.tracks).toEqual([]);
  });
});

describe('trackingReducer — rpc subscribe/unsubscribe results', () => {
  it('subscribe result replaces the track for that token', () => {
    const state = withTracks([{ token: 'a', trackPoints: [] }]);

    const next = trackingReducer(
      state,
      rpcResponse({
        method: 'tracking.subscribe',
        type: 'result',
        params: { token: 'a' },
        result: [rpcPoint(1), rpcPoint(2)],
      }),
    );

    expect(next.tracks).toHaveLength(1);
    expect(next.tracks[0].token).toBe('a');
    expect(next.tracks[0].trackPoints.map((p) => p.id)).toEqual([1, 2]);
    // ISO string parsed into a Date by the schema.
    expect(next.tracks[0].trackPoints[0].ts).toBeInstanceOf(Date);
  });

  it('unsubscribe result removes the track for that token', () => {
    const state = withTracks([
      { token: 'a', trackPoints: [] },
      { token: 'b', trackPoints: [] },
    ]);

    const next = trackingReducer(
      state,
      rpcResponse({
        method: 'tracking.unsubscribe',
        type: 'result',
        params: { token: 'a' },
        result: null,
      }),
    );

    expect(next.tracks.map((t) => t.token)).toEqual(['b']);
  });

  it('ignores a response whose params lack a token', () => {
    const state = withTracks([{ token: 'a', trackPoints: [] }]);

    const next = trackingReducer(
      state,
      rpcResponse({
        method: 'tracking.subscribe',
        type: 'result',
        params: {},
        result: [rpcPoint(1)],
      }),
    );

    expect(next).toBe(state); // unchanged reference
  });
});

describe('trackingReducer — rpc addPoint event', () => {
  it('appends a point to an existing track', () => {
    const state = withTracks([{ token: 'a', trackPoints: [] }]);

    const next = trackingReducer(
      state,
      rpcEvent({
        method: 'tracking.addPoint',
        params: { token: 'a', ...rpcPoint(1) },
      }),
    );

    expect(next.tracks[0].trackPoints.map((p) => p.id)).toEqual([1]);
  });

  it('creates a track when none exists for the token', () => {
    const state = withTracks([]);

    const next = trackingReducer(
      state,
      rpcEvent({
        method: 'tracking.addPoint',
        params: { token: 'z', ...rpcPoint(5) },
      }),
    );

    expect(next.tracks).toHaveLength(1);
    expect(next.tracks[0].token).toBe('z');
    expect(next.tracks[0].trackPoints[0].id).toBe(5);
  });

  it('ignores a malformed addPoint event', () => {
    const state = withTracks([]);

    const next = trackingReducer(
      state,
      rpcEvent({ method: 'tracking.addPoint', params: { token: 'z' } }),
    );

    expect(next.tracks).toEqual([]);
  });
});
