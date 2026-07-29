import { distance } from '@turf/distance';
import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import type { Alternative, Step, StepCoordinate } from './actions.js';
import {
  flattenWithStructures,
  straightenStructures,
} from './structureElevation.js';

/** Pure tests for levelling the profile across bridges and tunnels. */

function step(
  coordinates: StepCoordinate[],
  structures?: Step['structures'],
): Step {
  return {
    maneuver: { type: 'continue' },
    distance: 0,
    duration: 0,
    name: '',
    mode: 'driving',
    geometry: { coordinates },
    ...(structures && { structures }),
  };
}

function alternative(steps: Step[]): Alternative {
  return {
    distance: 0,
    duration: 0,
    legs: [{ distance: 0, duration: 0, steps }],
  };
}

/** Spacing of the test lines below, in metres. */
const spacing = distance([0, 0], [0.01, 0], { units: 'meters' });

/** Roughly a metre along the equator — the spacing the render line has. */
const metre = 1 / 111320;

/** A line along the equator, one point per metre. */
function line(elevations: (number | undefined)[]): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: elevations.map((ele, i) =>
        ele === undefined ? [i * metre, 0] : [i * metre, 0, ele],
      ),
    },
  };
}

/** Distance along `line()` at the given point index, in metres. */
const at = (i: number) => distance([0, 0], [i * metre, 0], { units: 'meters' });

/** A flat road with a `depth`-deep hole over points `from`..`to`. */
const holed = (length: number, from: number, to: number, depth: number) =>
  Array.from({ length }, (_, i) => (i >= from && i <= to ? 100 - depth : 100));

describe('flattenWithStructures', () => {
  it('drops the vertex consecutive steps share', () => {
    const { coordinates } = flattenWithStructures(
      alternative([
        step([
          [0, 0],
          [1, 0],
        ]),
        step([
          [1, 0],
          [2, 0],
        ]),
      ]),
    );

    expect(coordinates).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
  });

  it('reports a structure as a span in metres along the line', () => {
    const { structures } = flattenWithStructures(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
            [0.02, 0],
          ],
          [{ from: 1, to: 2, kind: 'bridge' }],
        ),
      ]),
    );

    expect(structures).toHaveLength(1);
    expect(structures[0]!.start).toBeCloseTo(spacing, 6);
    expect(structures[0]!.end).toBeCloseTo(spacing * 2, 6);
  });

  it('joins the parts of a structure clipped into adjacent steps', () => {
    const { structures } = flattenWithStructures(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
          ],
          [{ from: 0, to: 1, kind: 'bridge' }],
        ),
        step(
          [
            [0.01, 0],
            [0.02, 0],
          ],
          [{ from: 0, to: 1, kind: 'bridge' }],
        ),
      ]),
    );

    expect(structures).toHaveLength(1);
    expect(structures[0]!.start).toBe(0);
    expect(structures[0]!.end).toBeCloseTo(spacing * 2, 6);
  });

  it('ignores steps without structures', () => {
    expect(
      flattenWithStructures(
        alternative([
          step([
            [0, 0],
            [1, 0],
          ]),
        ]),
      ).structures,
    ).toEqual([]);
  });
});

describe('straightenStructures', () => {
  it('returns the input feature when there is nothing to level', () => {
    const feature = line([100, 100, 100]);

    expect(straightenStructures(feature, [])).toBe(feature);
  });

  it('replaces the hole under a structure with a straight line', () => {
    const feature = line(holed(60, 25, 34, 8));

    const levelled = straightenStructures(feature, [
      { start: at(25), end: at(34), kind: 'bridge' },
    ]);

    for (const coord of levelled.geometry.coordinates.slice(26, 34)) {
      expect(coord[2]).toBeCloseTo(100, 6);
    }
  });

  it('leaves the profile outside the span untouched', () => {
    const raw = holed(60, 25, 34, 8);

    raw[5] = 91;

    raw[55] = 109;

    const levelled = straightenStructures(line(raw), [
      { start: at(25), end: at(34), kind: 'bridge' },
    ]);

    expect(levelled.geometry.coordinates[5]![2]).toBe(91);

    expect(levelled.geometry.coordinates[55]![2]).toBe(109);
  });

  it('is not tilted by a lone bad sample at the span edge', () => {
    // A tunnel portal is a likely place for one sample to sit metres above the
    // road; anchoring the whole bore on it would tilt the lot.
    const raw: number[] = Array.from({ length: 60 }, (_, i) =>
      i >= 25 && i <= 34 ? 108 : 100,
    );

    raw[25] = 104;

    const levelled = straightenStructures(line(raw), [
      { start: at(25), end: at(34), kind: 'tunnel' },
    ]);

    for (const coord of levelled.geometry.coordinates.slice(25, 35)) {
      expect(coord[2]).toBeCloseTo(100, 6);
    }
  });

  it('covers the span ends, where a short structure has all its samples', () => {
    // Nothing lies strictly between them, so replacing only the interior would
    // leave the whole notch in place.
    const raw = holed(60, 25, 26, 8);

    const levelled = straightenStructures(line(raw), [
      { start: at(25), end: at(26), kind: 'bridge' },
    ]);

    expect(levelled.geometry.coordinates[25]![2]).toBeCloseTo(100, 6);

    expect(levelled.geometry.coordinates[26]![2]).toBeCloseTo(100, 6);
  });

  it('never digs a bridge below the ground it spans', () => {
    // Reaching past the mapped ends is safe because the line is clamped: real
    // terrain outside the structure is already above it.
    const raw = holed(60, 25, 34, 8);

    raw[24] = 106;

    raw[35] = 106;

    const levelled = straightenStructures(line(raw), [
      { start: at(25), end: at(34), kind: 'bridge' },
    ]);

    expect(levelled.geometry.coordinates[24]![2]).toBe(106);

    expect(levelled.geometry.coordinates[35]![2]).toBe(106);
  });

  it('keeps the profile when there is no road to anchor on', () => {
    const raw: (number | undefined)[] = holed(60, 25, 34, 8);

    for (let i = 0; i <= 25; i++) {
      raw[i] = undefined;
    }

    const feature = line(raw);

    expect(
      straightenStructures(feature, [
        { start: at(25), end: at(34), kind: 'bridge' },
      ]),
    ).toBe(feature);
  });

  it('does not mutate its input', () => {
    const feature = line(holed(60, 25, 34, 8));

    straightenStructures(feature, [
      { start: at(25), end: at(34), kind: 'bridge' },
    ]);

    expect(feature.geometry.coordinates[30]![2]).toBe(92);
  });
});
