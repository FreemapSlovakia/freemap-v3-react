import { describe, expect, it } from 'vitest';
import type { PanoramaDepth } from '../depth.js';
import { horizonProfile, skylineAt } from './horizon.js';
import {
  dayTrack,
  skyEvents,
  skyObserver,
  type TrackSample,
  trackAt,
  withCentreCrossings,
} from './track.js';

/** One distance per pixel; `0` is sky. Distances are encoded as the depth does. */
function depthOf(rows: number[][]): PanoramaDepth {
  const height = rows.length;

  const width = rows[0]?.length ?? 0;

  const nearM = 1;

  const farM = 1_000_000;

  const encode = (m: number) =>
    m === 0
      ? 0
      : Math.round(1 + (Math.log(m / nearM) / Math.log(farM / nearM)) * 65534);

  return {
    width,
    height,
    values: Uint16Array.from(rows.flat().map(encode)),
    nearM,
    farM,
    sky: 0,
  };
}

const frame = {
  altMax: 4,
  altMin: -4,
  stepDeg: 1,
};

describe('horizonProfile', () => {
  it('reads the top edge of the first terrain row', () => {
    const profile = horizonProfile(
      frame,
      depthOf([
        [0, 0, 5000],
        [0, 1000, 4000],
        [0, 900, 3000],
        [0, 800, 2000],
      ]),
    );

    expect([...profile.altitudes]).toEqual([-4, 3, 4]);

    expect([...profile.clippedBottom]).toEqual([1, 0, 0]);

    expect([...profile.clippedTop]).toEqual([0, 0, 1]);
  });
});

describe('dayTrack', () => {
  it('rises and sets over a level skyline at the almanac times', () => {
    // A full turn, one column a degree, every skyline at 0°.
    const turn = { azStart: 0, stepDeg: 1, width: 360, fov: 360 };

    const profile = {
      altitudes: new Float32Array(360),
      clippedTop: new Uint8Array(360),
      clippedBottom: new Uint8Array(360),
    };

    const observe = skyObserver(
      'sun',
      { lat: 48.1486, lon: 17.1077 },
      turn,
      profile,
    );

    const events = skyEvents(
      dayTrack(observe, [Date.UTC(2026, 5, 21), Date.UTC(2026, 5, 22)]),
      observe,
    );

    // 04:51 and 20:55 CEST.
    expect(events.map((e) => e.kind)).toEqual(['rise', 'set']);

    expect(
      Math.abs((events[0]?.time ?? 0) - Date.UTC(2026, 5, 21, 2, 51)),
    ).toBeLessThan(2 * 60_000);

    expect(
      Math.abs((events[1]?.time ?? 0) - Date.UTC(2026, 5, 21, 18, 55)),
    ).toBeLessThan(2 * 60_000);

    // Bisected: the upper limb sits on the skyline at the crossing.
    for (const event of events) {
      expect(Math.abs(event.altitude + event.radius)).toBeLessThan(0.01);
    }

    // And the drawn path turns where the centre does.
    const crossings = withCentreCrossings(
      dayTrack(observe, [Date.UTC(2026, 5, 21), Date.UTC(2026, 5, 22)]),
      observe,
    ).filter((s) => s.time % 60_000 !== 0);

    expect(crossings).toHaveLength(2);

    for (const crossing of crossings) {
      expect(Math.abs(crossing.altitude)).toBeLessThan(0.01);
    }
  });
});

describe('skyEvents', () => {
  const sample = (minute: number, visible: boolean | null): TrackSample => ({
    time: minute * 60_000,
    azimuth: minute,
    altitude: 0,
    radius: 0.25,
    visible,
    centreVisible: visible,
  });

  it('puts a crossing half way across the minute it happens in', () => {
    expect(
      skyEvents([sample(0, false), sample(1, true), sample(2, false)]).map(
        (e) => [e.kind, e.time],
      ),
    ).toEqual([
      ['rise', 30_000],
      ['set', 90_000],
    ]);
  });

  it('reports no change across a stretch it cannot read', () => {
    expect(
      skyEvents([sample(0, false), sample(1, null), sample(2, true)]),
    ).toEqual([]);
  });
});

describe('trackAt', () => {
  const at = (
    minute: number,
    azimuth: number,
    altitude: number,
    visible: boolean | null = true,
  ): TrackSample => ({
    time: minute * 60_000,
    azimuth,
    altitude,
    radius: 0.25,
    visible,
    centreVisible: visible,
  });

  const all: [number, number] = [-90, 90];

  it('interpolates between the samples either side, across north', () => {
    expect(trackAt([at(0, 358, 10), at(1, 2, 20)], 359, 0, -5, all)).toEqual({
      time: 15_000,
      altitude: 12.5,
    });
  });

  it('picks the crossing nearest the pointer, among those on screen', () => {
    const samples = [at(0, 90, 10), at(1, 100, 10), at(2, 90, 30)];

    expect(trackAt(samples, 95, 28, -5, all)?.altitude).toBe(20);

    expect(trackAt(samples, 95, 0, -5, all)?.altitude).toBe(10);

    expect(trackAt(samples, 95, 28, -5, [0, 15])?.altitude).toBe(10);
  });

  it('skips what is not drawn', () => {
    expect(
      trackAt([at(0, 90, -10), at(1, 100, -9)], 95, 0, -5, all),
    ).toBeNull();

    expect(
      trackAt([at(0, 90, 10, null), at(1, 100, 9)], 95, 0, -5, all),
    ).toBeNull();
  });

  it('does not read across a swing past the zenith', () => {
    expect(
      trackAt([at(0, 10, 89), at(1, 170, 89)], 90, 89, -5, all),
    ).toBeNull();
  });
});

describe('skylineAt', () => {
  const profile = horizonProfile(
    frame,
    depthOf([
      [0, 0, 5000],
      [0, 1000, 4000],
    ]),
  );

  const slice = { azStart: 0, stepDeg: 1, width: 3, fov: 3 };

  it('reads the column at a bearing, and nothing where the frame clips it', () => {
    expect(skylineAt(slice, profile, 1.5)).toBe(3);

    expect(skylineAt(slice, profile, 0.5)).toBeNull();

    expect(skylineAt(slice, profile, 2.5)).toBeNull();
  });
});
