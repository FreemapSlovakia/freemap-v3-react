import { describe, expect, it } from 'vitest';
import type { ElevationProfilePoint } from './model/reducer.js';
import {
  elevatedRuns,
  profilePointAtDistance,
  profileSlice,
  projectOnProfile,
} from './profilePoint.js';

// A profile running due east along the equator, where a degree of longitude and
// a degree of latitude are the same length, so a projection's result reads off
// the coordinates directly.
const profile: ElevationProfilePoint[] = [
  { lat: 0, lon: 0, distance: 0, ele: 100, climbUp: 0, climbDown: 0 },
  { lat: 0, lon: 1, distance: 100, ele: 200, climbUp: 100, climbDown: 0 },
  { lat: 0, lon: 2, distance: 200, ele: 150, climbUp: 100, climbDown: 50 },
];

describe('profilePointAtDistance', () => {
  it('returns nothing for an empty profile', () => {
    expect(profilePointAtDistance([], 0)).toBeUndefined();
  });

  it('interpolates between the samples the distance falls between', () => {
    expect(profilePointAtDistance(profile, 50)).toEqual({
      lat: 0,
      lon: 0.5,
      distance: 50,
      ele: 150,
      climbUp: 50,
      climbDown: 0,
    });
  });

  it('clamps to the profile ends', () => {
    expect(profilePointAtDistance(profile, -10)).toBe(profile[0]);

    expect(profilePointAtDistance(profile, 1000)).toBe(profile[2]);
  });

  it('carries no elevation across a gap', () => {
    const gapped: ElevationProfilePoint[] = [
      { lat: 0, lon: 0, distance: 0, ele: 100 },
      { lat: 0, lon: 1, distance: 100, ele: NaN },
    ];

    expect(profilePointAtDistance(gapped, 40)?.ele).toBe(100);

    expect(profilePointAtDistance(gapped, 60)?.ele).toBeNaN();
  });
});

describe('projectOnProfile', () => {
  it('returns nothing for an empty profile', () => {
    expect(projectOnProfile([], 0, 0)).toBeUndefined();
  });

  it('projects onto the segment, not onto the nearest sample', () => {
    // Beside the middle of the first segment: the samples at either end are
    // farther away than the place on the line between them.
    expect(projectOnProfile(profile, 0.1, 0.5)).toMatchObject({
      lat: 0,
      lon: 0.5,
      distance: 50,
    });
  });

  it('clamps to a segment end when the position is past it', () => {
    expect(projectOnProfile(profile, 0, -1)).toMatchObject({
      lon: 0,
      distance: 0,
    });

    expect(projectOnProfile(profile, 0, 3)).toMatchObject({
      lon: 2,
      distance: 200,
    });
  });

  it('does not project onto the jump between two recording segments', () => {
    // A pause: the gap point repeats the first segment's tail, and the second
    // segment starts a degree away at the same distance.
    const paused: ElevationProfilePoint[] = [
      { lat: 0, lon: 0, distance: 0, ele: 100 },
      { lat: 0, lon: 1, distance: 100, ele: 200 },
      { lat: 0, lon: 1, distance: 100, ele: NaN },
      { lat: 0, lon: 2, distance: 100, ele: 300 },
      { lat: 0, lon: 3, distance: 200, ele: 400 },
    ];

    // In the empty space between the two segments: the nearest place on the
    // line is the second segment's start, not a place along the jump.
    expect(projectOnProfile(paused, 0, 1.6)).toMatchObject({
      lon: 2,
      distance: 100,
      ele: 300,
    });
  });

  it('scales longitude by the latitude, so far north it still projects onto the segment', () => {
    const northern: ElevationProfilePoint[] = [
      { lat: 60, lon: 0, distance: 0, ele: 0 },
      { lat: 60, lon: 1, distance: 100, ele: 0 },
    ];

    expect(projectOnProfile(northern, 60.1, 0.25)).toMatchObject({
      lon: 0.25,
      distance: 25,
    });
  });
});

describe('profileSlice', () => {
  it('interpolates both ends and keeps what lies between', () => {
    expect(
      profileSlice(profile, 50, 150).map(({ distance }) => distance),
    ).toEqual([50, 100, 150]);
  });

  it('takes no sample twice when an end falls on one', () => {
    // The bisection has to start past a sample the interpolated end already is,
    // or the stretch would carry it twice and a stats scan would count it so.
    expect(
      profileSlice(profile, 100, 200).map(({ distance }) => distance),
    ).toEqual([100, 200]);
  });

  it('is the two interpolated ends alone where no sample falls between', () => {
    expect(profileSlice(profile, 40, 60).map(({ ele }) => ele)).toEqual([
      140, 160,
    ]);
  });

  it('clamps to the profile, so a stretch reaching past it is not extrapolated', () => {
    // And still carries each sample once: the clamped ends stand on the first
    // and last of them.
    expect(
      profileSlice(profile, -50, 500).map(({ distance }) => distance),
    ).toEqual([0, 100, 200]);
  });

  it('is empty for an empty profile', () => {
    expect(profileSlice([], 0, 100)).toEqual([]);
  });
});

describe('elevatedRuns', () => {
  it('breaks at a point with no elevation and drops it', () => {
    const paused: ElevationProfilePoint[] = [
      { lat: 0, lon: 0, distance: 0, ele: 100 },
      { lat: 0, lon: 1, distance: 100, ele: 200 },
      { lat: 0, lon: 1, distance: 100, ele: NaN },
      { lat: 0, lon: 2, distance: 100, ele: 300 },
    ];

    expect(
      elevatedRuns(paused).map((run) => run.map(({ ele }) => ele)),
    ).toEqual([[100, 200], [300]]);
  });

  it('yields one run for a whole profile, and none for one with no elevation', () => {
    expect(elevatedRuns(profile)).toHaveLength(1);

    expect(elevatedRuns([{ lat: 0, lon: 0, distance: 0, ele: NaN }])).toEqual(
      [],
    );
  });
});
