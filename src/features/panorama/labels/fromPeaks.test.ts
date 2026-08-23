import { describe, expect, it } from 'vitest';
import { candidateLabels, hazeCutoffM, rankLabels } from './fromPeaks.js';
import type { PanoramaLabel } from './types.js';

function label(
  id: string,
  distance: number,
  dominance?: number,
): PanoramaLabel {
  return {
    id,
    name: id,
    lat: 0,
    lon: 0,
    ele: 1000,
    distance,
    azimuth: 0,
    y: 0,
    ...(dominance === undefined ? {} : { dominance }),
  };
}

/** The doc's own example: a hill two ridges away against a giant on the horizon. */
const hill = label('hill', 20_000, 300);

const giant = label('giant', 177_000, 1500);

/** Halfway between real and apparent size, which is the default. */
const halfway = { hazeKm: 120, distanceWeight: 0.5 };

/** No falloff, so the weighting is the only thing deciding. */
const clear = { hazeKm: 0, distanceWeight: 0.5 };

const ids = (labels: PanoramaLabel[]) => labels.map((l) => l.id);

describe('panorama label ranking', () => {
  it('puts the seeable hill over the giant on the horizon', () => {
    expect(ids(rankLabels([giant, hill], halfway))).toEqual(['hill', 'giant']);
  });

  it('lets size win once the air is clear', () => {
    expect(ids(rankLabels([hill, giant], clear))).toEqual(['giant', 'hill']);
  });

  it('ranks a top under its own ridge below every one that stands clear', () => {
    const under = label('under', 1000, -50);

    expect(ids(rankLabels([under, giant, hill], halfway))).toEqual([
      'hill',
      'giant',
      'under',
    ]);
  });

  it('ranks something that measures no dominance on distance alone', () => {
    const near = label('near', 5000);

    const far = label('far', 50_000);

    expect(ids(rankLabels([far, near], halfway))).toEqual(['near', 'far']);
  });

  it('names the great mountain at a weight of zero, whatever the distance', () => {
    expect(
      ids(rankLabels([hill, giant], { ...clear, distanceWeight: 0 })),
    ).toEqual(['giant', 'hill']);
  });

  it('names what fills the view at a weight of one', () => {
    expect(
      ids(rankLabels([giant, hill], { ...clear, distanceWeight: 1 })),
    ).toEqual(['hill', 'giant']);
  });

  it('costs a summit twice as far the distance raised to the weight', () => {
    // Same ground, one twice as far: at a weight of one it is worth half, and
    // 190 m does not clear that. At halfway it only owes √2, and does.
    const near = label('near', 10_000, 100);

    const far = label('far', 20_000, 190);

    expect(
      ids(rankLabels([near, far], { ...clear, distanceWeight: 1 })),
    ).toEqual(['near', 'far']);

    expect(ids(rankLabels([near, far], clear))).toEqual(['far', 'near']);
  });
});

describe('panorama haze cutoff', () => {
  it('ends the names three times past where the haze starts', () => {
    expect(hazeCutoffM({ hazeKm: 40, distanceWeight: 0.5 })).toBe(120_000);
  });

  it('never cuts in clear air', () => {
    expect(hazeCutoffM(clear)).toBe(Infinity);
  });

  it('leaves the default reaching past what the service renders', () => {
    // 300 km is what a render holds when no `range` is asked for, which is what
    // the client does — so at the default the cut is inert.
    expect(hazeCutoffM(halfway)).toBeGreaterThan(300_000);
  });
});

describe('panorama label candidates', () => {
  it('takes what passes both cuts, best first', () => {
    expect(ids(candidateLabels([giant, hill], halfway, 0))).toEqual([
      'hill',
      'giant',
    ]);
  });

  it('drops what does not stand out enough', () => {
    expect(ids(candidateLabels([giant, hill], halfway, 1000))).toEqual([
      'giant',
    ]);
  });

  it('drops what the haze has ended the names past', () => {
    expect(
      ids(candidateLabels([giant, hill], { ...halfway, hazeKm: 40 }, 0)),
    ).toEqual(['hill']);
  });

  it('keeps a top under its own ridge where nothing is filtered', () => {
    const under = label('under', 1000, -50);

    expect(ids(candidateLabels([under], halfway, -100_000))).toEqual(['under']);
  });
});
