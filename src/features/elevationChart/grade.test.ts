import { describe, expect, it } from 'vitest';
import { gradeAt } from './grade.js';
import type { ElevationProfilePoint } from './model/reducer.js';

const climbing = (
  distance: number,
  ele: number,
  lon = 0,
): ElevationProfilePoint => ({
  lat: 0,
  lon,
  distance,
  ele,
});

/** The marked place that far along, as the pointer leaves it. */
const marked = (distance: number) => climbing(distance, Number.NaN);

describe('gradeAt', () => {
  it('measures over a window of the asked-for length', () => {
    const profile = [
      climbing(0, 100),
      climbing(100, 110),
      climbing(200, 190),
      climbing(300, 200),
    ];

    // 100 m either side of the middle: 90 m of rise over 200 m of run.
    expect(gradeAt(profile, marked(200), 200)).toBeCloseTo(0.45, 10);

    // A window shorter than the sample spacing measures across the segment the
    // place stands on — here the one behind, the place standing on a sample.
    expect(gradeAt(profile, marked(200), 0)).toBeCloseTo(0.8, 10);
  });

  it('measures the segment the place stands on, not the one behind it', () => {
    // A hand-drawn GPX: flat for 100 m, then a 50 % climb, with a sample only
    // where the slope changes.
    const profile = [climbing(0, 100), climbing(100, 100), climbing(200, 150)];

    for (const distance of [101, 130, 150, 199]) {
      expect(gradeAt(profile, marked(distance), 0)).toBeCloseTo(0.5, 10);
    }

    for (const distance of [1, 50, 99]) {
      expect(gradeAt(profile, marked(distance), 0)).toBeCloseTo(0, 10);
    }
  });

  it('slides the window with the place rather than by whole samples', () => {
    // A stretch of a hand-drawn ski-course GPX, its samples 12–40 m apart: a
    // climb, a flat top, a 10 m drop over 29 m, then a long flat run.
    const profile = [
      climbing(2003.6, 1374),
      climbing(2033.3, 1374),
      climbing(2065.7, 1376),
      climbing(2082.4, 1376),
      climbing(2094.8, 1378),
      climbing(2109.5, 1378),
      climbing(2138.6, 1368),
      climbing(2178.6, 1368),
      climbing(2213.0, 1368),
    ];

    // The window is the length asked for, its ends interpolated: 50 m centered
    // on the drop reaches flat ground either side, so it reads the 10 m the
    // terrain falls over exactly those 50 m.
    expect(gradeAt(profile, marked(2124), 50)).toBeCloseTo(-0.2, 10);

    // Approaching that drop the readout steepens with every metre, rather than
    // standing still until the window snaps onto the next sample.
    const approach = [2104, 2108, 2112, 2116, 2120].map((distance) =>
      gradeAt(profile, marked(distance), 50),
    );

    for (let i = 1; i < approach.length; i++) {
      expect(approach[i]!).toBeLessThan(approach[i - 1]!);
    }
  });

  it('keeps the window its full length where the place stands off the stretch', () => {
    // A track whose fixes stop carrying altitude partway: the pointer 30 m past
    // the last elevated sample keeps that sample's elevation, so it reads, but
    // the window it asks for lies wholly behind it.
    const profile = [
      climbing(0, 100),
      climbing(20, 100),
      climbing(50, 100),
      climbing(100, 150),
      climbing(200, Number.NaN),
    ];

    // The elevated stretch is 100 m long, so a 100 m window slid against its
    // end covers all of it — not the 80 m back to the sample nearest where the
    // window would have started had the place been on the stretch.
    expect(gradeAt(profile, climbing(130, 150), 100)).toBeCloseTo(0.5, 10);
  });

  it('keeps a window off terrain the place is nowhere near', () => {
    // A stretch of a hand-drawn ski-course GPX: a flat top, a 10 m drop over
    // 29 m, then a long flat run. Anchoring on the sample nearest the place
    // rather than on the place itself swaps the two readings below — the drop
    // reported from the flat 15 m past it, and the flat from the middle of the
    // drop.
    const profile = [
      climbing(2094.8, 1378),
      climbing(2109.5, 1378),
      climbing(2138.6, 1368),
      climbing(2178.6, 1368),
    ];

    expect(gradeAt(profile, marked(2115), 0)).toBeCloseTo(-0.344, 3);

    expect(gradeAt(profile, marked(2154), 0)).toBeCloseTo(0, 10);
  });

  it('measures between the line’s ends when the window is unbounded', () => {
    const profile = [
      climbing(0, 315),
      climbing(1000, 500),
      climbing(1800, 420),
      climbing(3200, 649),
    ];

    const overall = (649 - 315) / 3200;

    // The whole line, so the same reading wherever the place stands on it —
    // the angle its far end is seen at from its near one.
    for (const distance of [0, 500, 1000, 2500, 3200]) {
      expect(
        gradeAt(profile, marked(distance), Number.POSITIVE_INFINITY),
      ).toBeCloseTo(overall, 10);
    }

    expect((Math.atan(overall) * 180) / Math.PI).toBeCloseTo(5.96, 2);
  });

  it('stops an unbounded window at a gap, measuring only its own stretch', () => {
    // A pause: the recording stops at one place and resumes at another, the two
    // ends and the gap between them all standing at the same distance.
    const profile = [
      climbing(0, 100, 0),
      climbing(500, 200, 1),
      climbing(500, Number.NaN, 2),
      climbing(500, 300, 3),
      climbing(1500, 350, 4),
    ];

    expect(
      gradeAt(
        profile,
        climbing(250, Number.NaN, 0.5),
        Number.POSITIVE_INFINITY,
      ),
    ).toBeCloseTo(0.2, 10);

    expect(
      gradeAt(
        profile,
        climbing(1000, Number.NaN, 3.5),
        Number.POSITIVE_INFINITY,
      ),
    ).toBeCloseTo(0.05, 10);

    // Standing on the gap itself there is nothing to measure.
    expect(
      gradeAt(profile, climbing(500, Number.NaN, 2), Number.POSITIVE_INFINITY),
    ).toBeUndefined();

    // The pause's two ends stand at the same distance, so only their position
    // says which stretch a place on one of them belongs to.
    expect(
      gradeAt(profile, climbing(500, 200, 1), Number.POSITIVE_INFINITY),
    ).toBeCloseTo(0.2, 10);

    expect(
      gradeAt(profile, climbing(500, 300, 3), Number.POSITIVE_INFINITY),
    ).toBeCloseTo(0.05, 10);
  });

  it('clamps to the profile’s own ends', () => {
    const profile = [climbing(0, 100), climbing(100, 150), climbing(200, 150)];

    expect(gradeAt(profile, marked(-10), 0)).toBeCloseTo(0.5, 10);

    expect(gradeAt(profile, marked(1000), 0)).toBeCloseTo(0, 10);
  });

  it('has nothing to measure on an empty profile', () => {
    expect(gradeAt([], marked(0), 50)).toBeUndefined();
  });
});
