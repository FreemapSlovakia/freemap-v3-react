import { angleDiff, mod } from '@shared/mathUtils.js';
import { describe, expect, it } from 'vitest';
import { layoutLabels, thinLabels } from './layout.js';
import type { PanoramaLabel } from './types.js';

/** Rank is the caller's, so these are given best first, by position. */
function label(id: string): PanoramaLabel {
  return {
    id,
    name: id,
    lat: 0,
    lon: 0,
    ele: 1000,
    distance: 10000,
    azimuth: 0,
    y: 0,
  };
}

const options = {
  measure: () => 50,
  viewportWidth: 400,
  lineHeight: 16,
  minLeader: 6,
  maxClimb: 140,
};

describe('panorama label layout', () => {
  it('places a lone label just above its summit', () => {
    const [placement] = layoutLabels([label('a')], {
      ...options,
      anchor: () => ({ x: 200, y: 150 }),
    });

    expect(placement).toMatchObject({ left: 175, top: 128, width: 50 });
  });

  it('climbs a line at a time out of a taken spot', () => {
    const placements = layoutLabels([label('a'), label('b')], {
      ...options,
      anchor: (l) => ({ x: l.id === 'a' ? 200 : 210, y: 150 }),
    });

    expect(placements.map((p) => p.top)).toEqual([128, 112]);
  });

  it('leaves a label alone when the one beside it does not overlap', () => {
    const placements = layoutLabels([label('a'), label('b')], {
      ...options,
      anchor: (l) => ({ x: l.id === 'a' ? 100 : 300, y: 150 }),
    });

    expect(placements.map((p) => p.top)).toEqual([128, 128]);
  });

  it('leaves a summit too near the top of the frame unnamed', () => {
    const placements = layoutLabels([label('a')], {
      ...options,
      anchor: () => ({ x: 200, y: 20 }),
    });

    expect(placements).toEqual([]);
  });

  it('keeps labels clear of the compass strip', () => {
    const placements = layoutLabels([label('a'), label('b')], {
      ...options,
      minTop: 22,
      anchor: () => ({ x: 200, y: 60 }),
    });

    expect(placements.map((p) => p.top)).toEqual([38, 22]);
  });

  it('keeps the highest ranked when the view is crowded', () => {
    // Given in rank order, which is the caller's part of the bargain.
    const placements = layoutLabels(
      [label('high'), label('mid'), label('low')],
      {
        ...options,
        anchor: () => ({ x: 200, y: 40 }),
      },
    );

    expect(placements.map((p) => p.label.id)).toEqual(['high', 'mid']);
  });

  it('skips what is off screen or has nowhere to point', () => {
    const placements = layoutLabels([label('a'), label('b')], {
      ...options,
      anchor: (l) => (l.id === 'a' ? null : { x: 900, y: 150 }),
    });

    expect(placements).toEqual([]);
  });
});

describe('panorama label thinning', () => {
  function at(id: string, azimuth: number): PanoramaLabel {
    return { ...label(id), azimuth };
  }

  it('keeps the first of a crowd inside one pitch', () => {
    const kept = thinLabels([at('a', 100), at('b', 103), at('c', 130)], 10);

    expect(kept.map((l) => l.id)).toEqual(['a', 'c']);
  });

  it('measures the gap the short way round north', () => {
    const kept = thinLabels([at('a', 358), at('b', 3)], 10);

    expect(kept.map((l) => l.id)).toEqual(['a']);
  });

  it('names everything when nothing is within a pitch', () => {
    const labels = [at('a', 0), at('b', 20), at('c', 40)];

    expect(thinLabels(labels, 10)).toEqual(labels);
  });

  /** What the buckets have to agree with: compare against everything kept. */
  function thinnedFlat(
    labels: PanoramaLabel[],
    minPitchDeg: number,
  ): PanoramaLabel[] {
    const kept: PanoramaLabel[] = [];

    for (const label of labels) {
      if (
        !kept.some(
          (k) => Math.abs(angleDiff(label.azimuth, k.azimuth)) < minPitchDeg,
        )
      ) {
        kept.push(label);
      }
    }

    return kept;
  }

  it('keeps exactly what a flat scan would, at every pitch', () => {
    // A fixed spread rather than a random one, so a failure is reproducible.
    // The multiplier is prime to 360, which walks the whole circle unevenly and
    // lands labels on both sides of every bucket edge.
    const labels = Array.from({ length: 400 }, (_, i) =>
      at(String(i), mod(i * 47.3, 360)),
    );

    for (const pitch of [0.05, 0.3, 1, 7, 23, 60, 90]) {
      expect(
        thinLabels(labels, pitch).map((l) => l.id),
        `pitch ${pitch}`,
      ).toEqual(thinnedFlat(labels, pitch).map((l) => l.id));
    }
  });

  it('agrees on labels sitting exactly on a bucket edge', () => {
    // Pitch 36 gives ten buckets of exactly 36°, so these land on the seams.
    const labels = [0, 36, 71.9, 72, 108, 359.9].map((az) =>
      at(String(az), az),
    );

    expect(thinLabels(labels, 36).map((l) => l.id)).toEqual(
      thinnedFlat(labels, 36).map((l) => l.id),
    );
  });
});
