import { readPathDetails } from '@shared/colorizers/colorize.js';
import { colorizerDetails, colorizingModes } from '@shared/colorizers/index.js';
import { categoricalColorizer } from '@shared/colorizers/modes/pathDetail.js';
import type { ColorizerMessages } from '@shared/colorizers/translations/ColorizerMessages.js';
import { TransportTypeSchema } from '@shared/transportTypeDefs.js';
import { distance } from '@turf/distance';
import type { Feature, LineString } from 'geojson';
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

/** The straight line the router leaves behind where it found no route. */
function errorStep(coordinates: StepCoordinate[]): Step {
  return { ...step(coordinates), mode: 'error' };
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
  });

  // The profiles layered on foot, hike and bike are graded on the same scale as
  // the profile they are built from, so they have to ask for the same rating —
  // easy to miss, because forgetting only greys the colouring out.
  it('carries the rating over to the profiles derived from those', () => {
    expect(pathDetailKeys('stroller')).toContain('hike_rating');
    expect(pathDetailKeys('easyhike')).toContain('hike_rating');
    expect(pathDetailKeys('ebike')).toContain('mtb_rating');
    expect(pathDetailKeys('gravelbike')).toContain('mtb_rating');
  });

  // One colorize mode reads either mask, and this is what decides which: a
  // walker is shown the signs a walker follows, a rider the ones a rider does.
  it('answers the waymark colours with the ones the profile follows', () => {
    expect(pathDetailKeys('hiking')).toContain('hiking_colours');
    expect(pathDetailKeys('hiking')).not.toContain('bike_colours');
    expect(pathDetailKeys('stroller')).toContain('hiking_colours');
    expect(pathDetailKeys('mtb')).toContain('bike_colours');
    expect(pathDetailKeys('mtb')).not.toContain('hiking_colours');
    expect(pathDetailKeys('gravelbike')).toContain('bike_colours');

    // A car follows neither, so the mode is not offered for one at all.
    expect(colorizerDetails('trailColor')).toEqual([
      'hiking_colours',
      'bike_colours',
    ]);

    expect(pathDetailKeys('car')).not.toContain('hiking_colours');
    expect(pathDetailKeys('car')).not.toContain('bike_colours');
  });

  // The point of the profile is that there should be none, so the detail is
  // what shows it avoided them rather than that none were on the way.
  it('asks the toll-avoiding car about tolls', () => {
    expect(pathDetailKeys('carnotoll')).toContain('toll');
  });

  it('asks every profile for what any of them can be described by', () => {
    for (const transport of [
      'car',
      'car4wd',
      'carnotoll',
      'hiking',
      'easyhike',
      'racingbike',
      'ebike',
      'gravelbike',
      'stroller',
    ] as const) {
      expect(pathDetailKeys(transport)).toEqual(
        expect.arrayContaining([
          'surface',
          'road_class',
          'track_type',
          'smoothness',
        ]),
      );
    }
  });

  // The route planner's menu offers a span-based mode by matching the
  // colorizer's `detail` against these keys, so a mode whose key is spelled
  // differently here would silently vanish from the dropdown.
  it('names every detail a colorizer reads', () => {
    const asked = new Set(
      TransportTypeSchema.options.flatMap((transport) =>
        pathDetailKeys(transport),
      ),
    );

    for (const mode of colorizingModes) {
      // A mode answered with one of several keys needs each of them asked for
      // by the profile it belongs to, or that profile shows the mode dead.
      for (const detail of colorizerDetails(mode)) {
        expect(asked).toContain(detail);
      }
    }
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

/** Two categories and the implicit Unknown, so a color is 0, 0.5 or 1. */
const colorizer = categoricalColorizer({
  detail: 'surface',
  categories: [
    { key: 'paved', values: ['asphalt'], color: [0, 0, 0] },
    { key: 'ground', values: ['ground'], color: [255, 255, 255] },
  ],
  labels: () => ({}),
});

describe('categoricalColorizer', () => {
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

  // The router values the whole line, `missing` included, so the detail coming
  // back says nothing about whether anything is mapped.
  it('is not offered where every stretch is unnamed', () => {
    expect(
      colorizer.isAvailable?.(
        routeColorizeFeatures(
          alternative([
            step(
              [
                [0, 0],
                [0.01, 0],
              ],
              { surface: [[0, 1, 'missing']] },
            ),
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

// Colorizing the straight line a failed leg leaves behind would replace the red
// dotted line that says so with a confident scale over whatever terrain it
// happens to cross.
describe('routeColorizeFeatures — a stretch that failed to route', () => {
  const partlyRouted = alternative([
    step(
      [
        [0, 0],
        [0.01, 0],
      ],
      { surface: [[0, 1, 'asphalt']] },
    ),
    errorStep([
      [0.01, 0],
      [0.03, 0],
    ]),
    step(
      [
        [0.03, 0],
        [0.04, 0],
      ],
      { surface: [[0, 1, 'gravel']] },
    ),
  ]);

  // The plain line steps aside wherever anything is colorized, so a run the
  // colorizer declined to paint would be a hole in the route.
  it('paints a run holding none of the detail rather than leaving it undrawn', () => {
    const features = routeColorizeFeatures(
      alternative([
        step(
          [
            [0, 0],
            [0.01, 0],
          ],
          { surface: [[0, 1, 'asphalt']] },
        ),
        errorStep([
          [0.01, 0],
          [0.03, 0],
        ]),
        // A manual leg: no detail of any kind reaches this run.
        step([
          [0.03, 0],
          [0.04, 0],
        ]),
      ]),
    );

    const runs = colorizer.compute(features);

    expect(runs).toHaveLength(2);

    // Unknown is the last of the palette, and covers that run end to end.
    expect(runs[1]!.every((point) => point.color === 1)).toBe(true);

    expect(runs[1]!.at(0)!.lon).toBeCloseTo(0.03, 9);

    expect(runs[1]!.at(-1)!.lon).toBeCloseTo(0.04, 9);
  });

  it('is cut out, leaving a feature per routed run', () => {
    const features = routeColorizeFeatures(partlyRouted);

    expect(features).toHaveLength(2);

    expect(features[0]!.geometry.coordinates).toEqual([
      [0, 0],
      [0.01, 0],
    ]);

    expect(features[1]!.geometry.coordinates).toEqual([
      [0.03, 0],
      [0.04, 0],
    ]);
  });

  it('measures a run’s details from its own start', () => {
    const surfaceOf = (feature: Feature<LineString> | undefined) =>
      feature && readPathDetails(feature, 'surface');

    const [first, second] = routeColorizeFeatures(partlyRouted);

    expect(surfaceOf(first)?.[0]?.value).toBe('asphalt');

    expect(surfaceOf(first)?.[0]?.start).toBe(0);

    // The second run begins three spacings along the whole line, so its own
    // span has to start at zero — or its color would land a run's length away.
    expect(surfaceOf(second)?.[0]?.value).toBe('gravel');

    expect(surfaceOf(second)?.[0]?.start).toBe(0);

    expect(surfaceOf(second)?.[0]?.end).toBeCloseTo(spacing, 3);
  });

  it('leaves a fully failed route with nothing to colorize', () => {
    expect(
      routeColorizeFeatures(
        alternative([
          errorStep([
            [0, 0],
            [0.02, 0],
          ]),
        ]),
      ),
    ).toEqual([]);
  });
});
