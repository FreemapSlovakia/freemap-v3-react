import {
  closeNarrowDips,
  despike,
  smoothElevation,
} from '@shared/elevationSmoothing.js';
import type { Feature, LineString, MultiLineString } from 'geojson';
import { describe, expect, it } from 'vitest';

/** Pure tests for filling the culvert ditches of a conditioned terrain model. */

/** Positions every 10 m, matching the elevation series' length. */
const at10m = (elevations: number[]) => elevations.map((_, i) => i * 10);

describe('closeNarrowDips', () => {
  it('fills a dip narrower than the window', () => {
    const e = [100, 100, 100, 92, 100, 100, 100];

    expect(closeNarrowDips(e, at10m(e), 40)).toEqual([
      100, 100, 100, 100, 100, 100, 100,
    ]);
  });

  it('leaves a dip wider than the window alone', () => {
    const e = [100, 100, 92, 92, 92, 92, 92, 100, 100];

    expect(closeNarrowDips(e, at10m(e), 30)).toEqual(e);
  });

  it('leaves a slope untouched', () => {
    const e = [100, 110, 120, 130, 140];

    expect(closeNarrowDips(e, at10m(e), 40)).toEqual(e);
  });

  it('leaves a peak untouched — it only fills downwards', () => {
    const e = [100, 100, 140, 100, 100];

    expect(closeNarrowDips(e, at10m(e), 40)).toEqual(e);
  });

  it('ignores a dip shallower than the minimum depth', () => {
    const e = [100, 100, 99.5, 100, 100];

    expect(closeNarrowDips(e, at10m(e), 40)).toEqual(e);
  });

  it('does nothing with a zero window', () => {
    const e = [100, 100, 92, 100, 100];

    expect(closeNarrowDips(e, at10m(e), 0)).toEqual(e);
  });

  // Bridged between the rims, so a dip between rims of different heights
  // leaves a ramp rather than a shelf and a step.
  it('fills a dip on a slope without flattening the slope', () => {
    const e = [100, 110, 120, 112, 140, 150];

    expect(closeNarrowDips(e, at10m(e), 40)).toEqual([
      100, 110, 120, 130, 140, 150,
    ]);
  });

  it('bridges each of two notches to its own rims', () => {
    // The rise between them isn't part of either dip, so it keeps its value
    // instead of being swallowed by one wide fill.
    const e = [100, 92, 106, 92, 100];

    expect(closeNarrowDips(e, at10m(e), 60)).toEqual([100, 103, 106, 103, 100]);
  });
});

describe('despike', () => {
  it('drops a spike narrower than half the window', () => {
    const e = [100, 100, 113, 100, 100];

    expect(despike(e, at10m(e), 40)).toEqual([100, 100, 100, 100, 100]);
  });

  it('drops a dip too, being symmetric', () => {
    const e = [100, 100, 88, 100, 100];

    expect(despike(e, at10m(e), 40)).toEqual([100, 100, 100, 100, 100]);
  });

  it('leaves a slope untouched', () => {
    const e = [100, 110, 120, 130, 140];

    expect(despike(e, at10m(e), 30)).toEqual(e);
  });

  it('keeps a feature wider than half the window', () => {
    const e = [100, 100, 113, 113, 113, 100, 100];

    expect(despike(e, at10m(e), 40)).toEqual(e);
  });

  it('does nothing with a zero window', () => {
    const e = [100, 100, 113, 100, 100];

    expect(despike(e, at10m(e), 0)).toEqual(e);
  });
});

describe('smoothElevation', () => {
  const line = (coordinates: Position3[]): Feature<LineString> => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates },
  });

  type Position3 = [number, number] | [number, number, number];

  /** Points ~11 m apart along the equator. */
  const at = (i: number) => i / 10000;

  it('returns the input feature when the window is zero', () => {
    const feature = line([
      [at(0), 0, 100],
      [at(1), 0, 90],
      [at(2), 0, 100],
    ]);

    expect(
      smoothElevation(feature, { despikeWindow: 0, ditchFillWindow: 0 }),
    ).toBe(feature);
  });

  it('returns the input feature when nothing needs filling', () => {
    const feature = line([
      [at(0), 0, 100],
      [at(1), 0, 110],
      [at(2), 0, 120],
    ]);

    expect(
      smoothElevation(feature, { despikeWindow: 0, ditchFillWindow: 50 }),
    ).toBe(feature);
  });

  it('does not mutate its input', () => {
    const feature = line([
      [at(0), 0, 100],
      [at(1), 0, 90],
      [at(2), 0, 100],
    ]);

    smoothElevation(feature, { despikeWindow: 0, ditchFillWindow: 50 });

    expect(feature.geometry.coordinates[1]![2]).toBe(90);
  });

  it('treats a gap in elevation as a break, not a dip', () => {
    const feature = line([
      [at(0), 0, 100],
      [at(1), 0],
      [at(2), 0, 100],
    ]);

    expect(
      smoothElevation(feature, { despikeWindow: 0, ditchFillWindow: 50 }),
    ).toBe(feature);
  });

  it('rounds off the flat steps a median leaves behind', () => {
    // A median outputs one of its own input samples, so it can only jump
    // between them; the averaging pass is what makes the join gradual.
    const feature = line(
      [100, 100, 100, 100, 113, 113, 113, 113].map(
        (ele, i) => [at(i), 0, ele] as Position3,
      ),
    );

    const eles = smoothElevation(feature, {
      despikeWindow: 60,
      ditchFillWindow: 0,
    }).geometry.coordinates.map((c) => c[2]!);

    expect(eles.some((ele) => ele > 100 && ele < 113)).toBe(true);
  });

  it('smooths each segment of a multi-segment track on its own', () => {
    const feature: Feature<MultiLineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [at(0), 0, 100],
            [at(1), 0, 90],
            [at(2), 0, 100],
          ],
          [
            [at(10), 0, 200],
            [at(11), 0, 200],
          ],
        ],
      },
    };

    const smoothed = smoothElevation(feature, {
      despikeWindow: 0,
      ditchFillWindow: 50,
    });

    expect(smoothed.geometry.coordinates[0]!.map((c) => c[2])).toEqual([
      100, 100, 100,
    ]);

    expect(smoothed.geometry.coordinates[1]!.map((c) => c[2])).toEqual([
      200, 200,
    ]);
  });
});
