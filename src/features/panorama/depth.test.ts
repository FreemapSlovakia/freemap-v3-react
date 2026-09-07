import { describe, expect, it } from 'vitest';
import { distanceAt, type PanoramaDepth, visibleAtDistance } from './depth.js';

const NEAR = 1;

const FAR = 100_000;

const SKY = 0;

function encode(distance: number): number {
  const logNear = Math.log(NEAR);

  return Math.round(
    1 + ((Math.log(distance) - logNear) / (Math.log(FAR) - logNear)) * 65534,
  );
}

/** One column, top to bottom: sky, then terrain coming nearer down the frame. */
function column(distances: (number | null)[]): PanoramaDepth {
  return {
    width: 1,
    height: distances.length,
    values: Uint16Array.from(
      distances.map((d) => (d === null ? SKY : encode(d))),
    ),
    nearM: NEAR,
    farM: FAR,
    sky: SKY,
  };
}

describe('visibleAtDistance', () => {
  // A ridge at 1000 m hiding everything out to the 5000 m slope beyond it.
  const depth = column([null, 10_000, 5000, 1000, 900, 800]);

  it('lands on the centre of the row standing at that distance', () => {
    const sample = visibleAtDistance(depth, 0, 900);

    // Not exactly the centre: the stored value is quantised, so the asked-for
    // distance falls a fraction of a row off the one that was stored.
    expect(sample?.iy).toBeCloseTo(4.5, 2);

    expect(sample?.distance).toBe(900);
  });

  it('interpolates between two rows of one slope, keeping the place', () => {
    const sample = visibleAtDistance(depth, 0, Math.sqrt(900 * 800));

    // The geometric mean of the two, the encoding being logarithmic.
    expect(sample?.iy).toBeCloseTo(5, 2);

    expect(sample?.distance).toBeCloseTo(Math.sqrt(900 * 800), 3);

    expect(sample?.visible).toBe(true);
  });

  it('moves a hidden place to the ridge that hides it', () => {
    const sample = visibleAtDistance(depth, 0, 1600);

    expect(sample?.iy).toBeCloseTo(3.5, 3);

    expect(sample?.distance).toBeCloseTo(1000, 0);

    // Which is what a mark being dragged shows nothing at all for.
    expect(sample?.visible).toBe(false);
  });

  it('moves it to the terrain beyond instead where that is nearer', () => {
    const sample = visibleAtDistance(depth, 0, 4000);

    expect(sample?.iy).toBeCloseTo(2.5, 3);

    expect(sample?.distance).toBeCloseTo(5000, 0);

    expect(sample?.visible).toBe(false);
  });

  it('answers with the silhouette where the place is beyond everything', () => {
    const sample = visibleAtDistance(depth, 0, 50_000);

    expect(sample?.iy).toBeCloseTo(1.5, 3);

    expect(sample?.distance).toBeCloseTo(10_000, 0);
  });

  it('holds a place nearer than the frame at its bottom edge', () => {
    const sample = visibleAtDistance(depth, 0, 10);

    expect(sample?.iy).toBeCloseTo(5.5, 3);

    expect(sample?.distance).toBeCloseTo(800, 0);
  });

  it('answers nothing for a column of sky, or one off the picture', () => {
    expect(visibleAtDistance(column([null, null]), 0, 1000)).toBeNull();

    expect(visibleAtDistance(depth, 1, 1000)).toBeNull();
  });

  it('reads back through distanceAt', () => {
    const sample = visibleAtDistance(depth, 0, 5000);

    expect(distanceAt(depth, 0, sample?.iy ?? 0)).toBeCloseTo(5000, 0);
  });
});
