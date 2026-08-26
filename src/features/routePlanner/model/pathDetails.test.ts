import { categoricalColorizer } from '@shared/colorizers/modes/pathDetail.js';
import type { ColorizerMessages } from '@shared/colorizers/translations/ColorizerMessages.js';
import { distance } from '@turf/distance';
import { describe, expect, it } from 'vitest';
import type { Alternative, Step, StepCoordinate } from './actions.js';
import {
  flattenPathDetails,
  pathDetailKeys,
  routeColorizeFeatures,
} from './pathDetails.js';

/** Pure tests for path details: per-step ranges in, metre spans out. */

function step(coordinates: StepCoordinate[], details?: Step['details']): Step {
  return {
    maneuver: { type: 'continue' },
    distance: 0,
    duration: 0,
    name: '',
    mode: 'driving',
    geometry: { coordinates },
    ...(details && { details }),
  };
}

/** Two legs of two steps each, so the leg joint is exercised too. */
function alternative(steps: Step[]): Alternative {
  return {
    distance: 0,
    duration: 0,
    legs: steps.map((s) => ({ distance: 0, duration: 0, steps: [s] })),
  };
}

/** Spacing of the test lines below, in metres. */
const spacing = distance([0, 0], [0.01, 0], { units: 'meters' });

describe('pathDetailKeys', () => {
  it('asks for the rating the profile can show, and no other', () => {
    expect(pathDetailKeys('hiking')).toContain('hike_rating');
    expect(pathDetailKeys('hiking')).not.toContain('mtb_rating');
    expect(pathDetailKeys('mtb')).toContain('mtb_rating');
    expect(pathDetailKeys('car')).toEqual(['surface', 'road_class']);
  });
});

describe('flattenPathDetails', () => {
  it('maps a step range onto the whole line, in metres', () => {
    const details = flattenPathDetails(
      alternative([
        step([
          [0, 0],
          [0.01, 0],
          [0.02, 0],
        ]),
        step(
          [
            [0.02, 0],
            [0.03, 0],
          ],
          { surface: [[0, 1, 'gravel']] },
        ),
      ]),
    );

    expect(details['surface']?.[0]?.value).toBe('gravel');

    expect(details['surface']?.[0]?.start).toBeCloseTo(2 * spacing, 3);

    expect(details['surface']?.[0]?.end).toBeCloseTo(3 * spacing, 3);
  });

  // The router reports one range per stretch, but it is clipped into every step
  // it crosses on the way in; a legend counting those parts separately would be
  // right about the distance and wrong about everything else.
  it('joins a stretch the steps clipped apart', () => {
    const details = flattenPathDetails(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
          ],
          { surface: [[0, 1, 'asphalt']] },
        ),
        step(
          [
            [0.01, 0],
            [0.02, 0],
          ],
          { surface: [[0, 1, 'asphalt']] },
        ),
      ]),
    );

    expect(details['surface']).toHaveLength(1);

    expect(details['surface']?.[0]?.end).toBeCloseTo(2 * spacing, 3);
  });

  it('keeps a change of value apart', () => {
    const details = flattenPathDetails(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
            [0.02, 0],
          ],
          {
            surface: [
              [0, 1, 'asphalt'],
              [1, 2, 'gravel'],
            ],
          },
        ),
      ]),
    );

    expect(details['surface']?.map((span) => span.value)).toEqual([
      'asphalt',
      'gravel',
    ]);
  });
});

describe('categoricalColorizer', () => {
  const colorizer = categoricalColorizer({
    detail: 'surface',
    categories: [
      { key: 'paved', values: ['asphalt'], color: [0, 0, 0] },
      { key: 'ground', values: ['ground'], color: [255, 255, 255] },
    ],
    labels: () => ({}),
  });

  const features = routeColorizeFeatures(
    alternative([
      step(
        [
          [0, 0],
          [0.01, 0],
          [0.02, 0],
        ],
        {
          surface: [
            [0, 1, 'asphalt'],
            [1, 2, 'ground'],
          ],
        },
      ),
    ]),
  );

  it('is offered only where the route carries the detail', () => {
    expect(colorizer.isAvailable?.(features)).toBeTruthy();

    expect(
      colorizer.isAvailable?.(
        routeColorizeFeatures(
          alternative([
            step([
              [0, 0],
              [0.01, 0],
            ]),
          ]),
        ),
      ),
    ).toBeFalsy();
  });

  // One list for the whole line: every list drawn becomes its own canvas layer,
  // and a real route has hundreds of stretches.
  it('draws the whole line as one list, changing color on the spot', () => {
    const runs = colorizer.compute(features);

    expect(runs).toHaveLength(1);

    const colors = runs[0]!.map((point) => point.color);

    // Two colors, and the change happens between two points of one coordinate,
    // so no segment of any length blends the two.
    expect(new Set(colors).size).toBe(2);

    const i = colors.findIndex((color, j) => j > 0 && color !== colors[j - 1]);

    expect(runs[0]![i]!.lon).toBeCloseTo(runs[0]![i - 1]!.lon, 9);

    expect(runs[0]![i]!.lat).toBeCloseTo(runs[0]![i - 1]!.lat, 9);
  });

  // A manual leg carries no detail, and a leg ridden by another profile carries
  // only what that one asked for — so a route can be valued in part.
  it('covers what no stretch values, rather than leaving the line undrawn', () => {
    const partly = routeColorizeFeatures(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
          ],
          { surface: [[0, 1, 'asphalt']] },
        ),
        step([
          [0.01, 0],
          [0.02, 0],
        ]),
      ]),
    );

    const run = colorizer.compute(partly)[0]!;

    expect(run.at(0)!.color).toBe(0);

    // The unvalued half runs to the end of the line, in the unknown color.
    expect(run.at(-1)!.color).toBe(1);

    expect(run.at(-1)!.lon).toBeCloseTo(0.02, 9);
  });

  // The legend is read as a summary of the route, so its distances have to add
  // up to it — including the parts nobody has mapped.
  it('counts unclaimed values and unvalued stretches as unknown', () => {
    const shares = colorizer.categories!(
      routeColorizeFeatures(
        alternative([
          step(
            [
              [0, 0],
              [0.01, 0],
              [0.02, 0],
            ],
            {
              surface: [
                [0, 1, 'asphalt'],
                [1, 2, 'missing'],
              ],
            },
          ),
          step([
            [0.02, 0],
            [0.03, 0],
          ]),
        ]),
      ),
      { categories: { unknown: 'Unknown' } } as ColorizerMessages,
    );

    expect(shares.map(({ key }) => key)).toEqual(['paved', 'unknown']);

    expect(shares[1]!.label).toBe('Unknown');

    // `missing` and the step no detail covers, together two thirds of the line.
    expect(shares[1]!.meters).toBeCloseTo(2 * spacing, 3);

    expect(shares.reduce((a, c) => a + c.meters, 0)).toBeCloseTo(
      3 * spacing,
      3,
    );
  });

  it('gives a value no category claims the unknown color', () => {
    const unmapped = routeColorizeFeatures(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
          ],
          { surface: [[0, 1, 'missing']] },
        ),
      ]),
    );

    // Last of the palette, and no gap: an unknown stretch is a category, not a
    // hole, so the whole line stays one canvas layer.
    expect(
      colorizer.compute(unmapped)[0]?.every((point) => point.color === 1),
    ).toBe(true);

    expect(colorizer.compute(unmapped)[0]?.some((point) => point.gap)).toBe(
      false,
    );
  });
});
