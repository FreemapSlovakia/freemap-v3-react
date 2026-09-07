import { gpx } from '@tmcw/togeojson';
import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  type HotlinePalette,
  NO_DATA_COLOR,
  PATH_DETAILS_PROP,
  paletteColorAt,
} from './colorize.js';
import { colorizers } from './index.js';
import { headingColorizer } from './modes/heading.js';
import { speedColorizer } from './modes/speed.js';
import {
  STEEPNESS_DEFAULT_SCALE,
  steepnessColorizer,
  steepnessGradeAt,
} from './modes/steepness.js';
import { timeColorizer } from './modes/time.js';
import { trailColorColorizer } from './modes/trailColors.js';
import colorizerMessages from './translations/en.messages.js';

// Builds a single-segment LineString feature with the given coordinates and
// per-point `coordinateProperties` arrays, mirroring what `@tmcw/togeojson`
// produces for a GPX track.
function line(
  coords: number[][],
  props: Record<string, unknown> = {},
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: props,
    geometry: { type: 'LineString', coordinates: coords },
  };
}

function parseGpxLines(xml: string): Feature<LineString>[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  return gpx(doc).features.filter(
    (f): f is Feature<LineString> => f.geometry?.type === 'LineString',
  );
}

// Four points on a straight east-west line, evenly spaced.
const COORDS = [
  [17.0, 48.0],
  [17.001, 48.0],
  [17.002, 48.0],
  [17.003, 48.0],
];

describe('speedColorizer', () => {
  it('is unavailable without timestamps or recorded speed', () => {
    expect(speedColorizer.isAvailable?.([line(COORDS)])).toBe(false);
  });

  it('is available from recorded speed alone (no timestamps)', () => {
    const f = line(COORDS, { coordinateProperties: { speeds: [1, 2, 3, 4] } });

    expect(speedColorizer.isAvailable?.([f])).toBe(true);
  });

  it('prefers recorded speed over the time-derived estimate', () => {
    // Even spacing + even timestamps make the derived speed constant (every
    // color 0.5). A varying recorded speed must instead drive the colors.
    const f = line(COORDS, {
      coordinateProperties: {
        times: [
          '2020-01-01T00:00:00Z',
          '2020-01-01T00:00:10Z',
          '2020-01-01T00:00:20Z',
          '2020-01-01T00:00:30Z',
        ],
        speeds: [1, 2, 3, 4],
      },
    });

    const colors = speedColorizer.compute([f])[0]!.map((p) => p.color);

    expect(colors[0]).toBeCloseTo(0);
    expect(colors[3]).toBeCloseTo(1);
  });

  it('falls back to deriving speed from coordinateProperties.times (GPX shape)', () => {
    const [f] = parseGpxLines(
      `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>
        <trkpt lat="48.0" lon="17.0"><time>2020-01-01T00:00:00Z</time></trkpt>
        <trkpt lat="48.0" lon="17.001"><time>2020-01-01T00:00:10Z</time></trkpt>
        <trkpt lat="48.0" lon="17.002"><time>2020-01-01T00:00:05Z</time></trkpt>
      </trkseg></trk></gpx>`,
    );

    expect(speedColorizer.isAvailable?.([f!])).toBe(true);
  });
});

describe('headingColorizer', () => {
  it('uses the recorded course over geometry-derived bearing', () => {
    // All points coincide, so the geometry-derived bearing would be a flat 0;
    // the recorded course must drive distinct hues instead.
    const coincident = COORDS.map(() => [17.0, 48.0]);

    const f = line(coincident, {
      coordinateProperties: { courses: [0, 90, 180, 270] },
    });

    const colors = headingColorizer.compute([f])[0]!.map((p) => p.color);

    expect(colors[0]).toBeCloseTo(0, 3);
    expect(colors[1]).toBeCloseTo(0.25, 3);
    expect(colors[2]).toBeCloseTo(0.5, 3);
    expect(colors[3]).toBeCloseTo(0.75, 3);
  });

  it('falls back to the segment bearing without a recorded course', () => {
    // Due east → bearing 90° → hue 0.25.
    const colors = headingColorizer
      .compute([line(COORDS)])[0]!
      .map((p) => p.color);

    expect(colors[0]).toBeCloseTo(0.25, 2);
  });
});

describe('timeColorizer', () => {
  it('is available from coordinateProperties.times (GPX import shape)', () => {
    const f = line(COORDS, {
      coordinateProperties: {
        times: [
          '2020-01-01T00:00:00Z',
          '2020-01-01T00:00:10Z',
          '2020-01-01T00:00:20Z',
          '2020-01-01T00:00:30Z',
        ],
      },
    });

    expect(timeColorizer.isAvailable?.([f])).toBe(true);
  });

  it('is available from a top-level coordTimes (live-tracking shape)', () => {
    const f = line(COORDS, {
      coordTimes: [
        '2020-01-01T00:00:00Z',
        '2020-01-01T00:00:10Z',
        '2020-01-01T00:00:20Z',
        '2020-01-01T00:00:30Z',
      ],
    });

    expect(timeColorizer.isAvailable?.([f])).toBe(true);
  });

  it('is unavailable without any timestamps', () => {
    expect(timeColorizer.isAvailable?.([line(COORDS)])).toBe(false);
  });
});

describe('steepnessColorizer', () => {
  // A north-south line of `n` points `stepM` apart, at the given constant grade.
  function slope(grade: number, n = 60, stepM = 10): Feature<LineString> {
    return line(
      Array.from({ length: n }, (_, i) => [
        17.0,
        48.0 + (i * stepM) / 111320,
        1000 + grade * i * stepM,
      ]),
    );
  }

  it('reads a constant slope back at its own grade', () => {
    // Through the scale's own inverse, so a wrongly mapped grade reads back as
    // the wrong grade rather than merely as a different color.
    for (const grade of [-0.3, -0.1, -0.01, 0, 0.01, 0.1, 0.3]) {
      const [points] = steepnessColorizer.compute([slope(grade)]);

      // The ends are measured over a window shifted inward, so only the middle
      // is a clean centered reading.
      for (const point of points!.slice(20, 40)) {
        expect(steepnessGradeAt(point.color)).toBeCloseTo(grade, 3);
      }
    }
  });

  // What the non-linear scale is for: a gentle grade has to move the color
  // enough to see, where a straight ±50 % ramp left a road route black.
  it('spends real palette on a gentle grade', () => {
    const [points] = steepnessColorizer.compute([slope(0.02)]);

    // A straight ramp would put 2 % at 0.52, indistinguishable from flat.
    expect(points![30]!.color).toBeGreaterThan(0.55);
  });

  it('clamps beyond the scale ends', () => {
    const [down] = steepnessColorizer.compute([
      slope(-STEEPNESS_DEFAULT_SCALE * 2),
    ]);

    const [up] = steepnessColorizer.compute([
      slope(STEEPNESS_DEFAULT_SCALE * 2),
    ]);

    expect(down![30]!.color).toBe(0);

    expect(up![30]!.color).toBe(1);
  });
});

describe('trailColorColorizer', () => {
  const RED = 1 << 0;
  const BLUE = 1 << 1;
  const GREEN = 1 << 2;
  const YELLOW = 1 << 3;

  const PURPLE = 1 << 6;

  const OTHER = 1 << 8;

  /** Metres per stretch. Their total overruns the line, so no gap trails them. */
  const SPAN = 300;

  // Consecutive `[mask, metres]` stretches, as `flattenPathDetails` hands them
  // over.
  const marked = (...runs: [mask: number, meters: number][]) => {
    let start = 0;

    return line(COORDS, {
      [PATH_DETAILS_PROP]: {
        hiking_colours: runs.map(([mask, meters]) => {
          const span = { start, end: start + meters, value: String(mask) };

          start += meters;

          return span;
        }),
      },
    });
  };

  /** Masks over equal stretches, where only their order is under test. */
  const even = (...masks: number[]): [number, number][] =>
    masks.map((mask) => [mask, SPAN]);

  /** How far each colour is painted, which is what the legend reports. */
  const shares = (...runs: [mask: number, meters: number][]) =>
    Object.fromEntries(
      trailColorColorizer.categories!([marked(...runs)], colorizerMessages).map(
        ({ key, meters }) => [key, meters],
      ),
    );

  it('names a stretch by the single colour its mask holds', () => {
    expect(shares(...even(GREEN))).toEqual({ green: SPAN });
  });

  it('paints a lone shared stretch in the first colour of the mask', () => {
    expect(shares(...even(RED | GREEN))).toEqual({ red: SPAN });
  });

  // A shared stretch takes the colour of what it runs between, so the line does
  // not flicker through a second colour and back.
  it('keeps the colour across a stretch a second route joins and leaves', () => {
    expect(shares(...even(YELLOW, YELLOW | BLUE, YELLOW))).toEqual({
      yellow: 3 * SPAN,
    });

    expect(shares(...even(YELLOW | BLUE, YELLOW))).toEqual({
      yellow: 2 * SPAN,
    });

    expect(shares(...even(YELLOW, YELLOW | BLUE))).toEqual({
      yellow: 2 * SPAN,
    });
  });

  // The change has to happen somewhere across the shared stretch; it goes to
  // whichever trail the route follows further, so the longer one runs unbroken.
  it('gives a shared stretch to the colour that runs furthest', () => {
    expect(
      shares([PURPLE, 100], [PURPLE | YELLOW, 200], [YELLOW, 200]),
    ).toEqual({ purple: 100, yellow: 400 });

    expect(
      shares([PURPLE, 200], [PURPLE | YELLOW, 200], [YELLOW, 100]),
    ).toEqual({ purple: 400, yellow: 100 });
  });

  // Only where the two run exactly as far as each other is there nothing to
  // weigh, and then the change falls as late as it can.
  it('changes colour as late as the marking allows', () => {
    expect(shares(...even(YELLOW, YELLOW | BLUE, BLUE))).toEqual({
      yellow: 2 * SPAN,
      blue: SPAN,
    });
  });

  it('leaves an unmarked stretch to Unknown rather than to a colour', () => {
    expect(shares(...even(0))).toEqual({ unknown: SPAN });

    expect(shares(...even(YELLOW, 0, YELLOW))).toEqual({
      yellow: 2 * SPAN,
      unknown: SPAN,
    });

    expect(trailColorColorizer.isAvailable?.([marked(...even(0))])).toBe(false);

    expect(trailColorColorizer.isAvailable?.([marked(...even(RED))])).toBe(
      true,
    );
  });

  // The colour in force carries across the gap, so the shared stretch after it
  // resumes in yellow; were the gap a break, blue would win it for costing no
  // change against the blue that follows.
  it('does not let an unmarked stretch break the colour flow', () => {
    expect(shares(...even(YELLOW, 0, YELLOW | BLUE, BLUE))).toEqual({
      yellow: 2 * SPAN,
      unknown: SPAN,
      blue: SPAN,
    });
  });

  // The profile decides which mask the route is answered with, so the mode has
  // to read a ride's colours off `bike_colours` just as it reads a walk's off
  // `hiking_colours`.
  it('reads whichever of the two masks the route carries', () => {
    const bike = line(COORDS, {
      [PATH_DETAILS_PROP]: {
        bike_colours: [{ start: 0, end: SPAN, value: String(RED) }],
      },
    });

    expect(trailColorColorizer.isAvailable?.([bike])).toBe(true);

    expect(
      trailColorColorizer.categories!([bike], colorizerMessages).map(
        ({ key }) => key,
      ),
    ).toEqual(['red']);
  });

  // A multimodal route asks per segment, so one line can carry both names over
  // stretches that never overlap. Reading only the first would paint the other
  // segment Unmarked and hide it from the run the colours are chosen along.
  const sharesOf = (details: Record<string, unknown>) =>
    Object.fromEntries(
      trailColorColorizer.categories!(
        [line(COORDS, { [PATH_DETAILS_PROP]: details })],
        colorizerMessages,
      ).map(({ key, meters }) => [key, meters]),
    );

  it('reads both masks where a multimodal route carries each in turn', () => {
    expect(
      sharesOf({
        hiking_colours: [{ start: 0, end: 300, value: String(RED) }],
        bike_colours: [{ start: 300, end: 600, value: String(BLUE) }],
      }),
    ).toEqual({ red: 300, blue: 300 });
  });

  // Grouped by key rather than by adjacency: the walk resumed after the ride is
  // the same network, so its yellow carries over the ride at no cost.
  it('rejoins a network the other one interrupted', () => {
    expect(
      sharesOf({
        hiking_colours: [
          { start: 0, end: 100, value: String(YELLOW) },
          { start: 200, end: 300, value: String(YELLOW | BLUE) },
        ],
        bike_colours: [{ start: 100, end: 200, value: String(BLUE) }],
      }),
    ).toEqual({ yellow: 200, blue: 100 });
  });

  // The two masks are unrelated networks that merely share a palette, so a red
  // hiking trail must not make a cycle route red where its own marking is blue.
  it('keeps the two networks apart when choosing colours', () => {
    expect(
      sharesOf({
        hiking_colours: [{ start: 0, end: 300, value: String(RED) }],
        bike_colours: [
          { start: 300, end: 600, value: String(RED | BLUE) },
          { start: 600, end: 900, value: String(BLUE) },
        ],
      }),
      // Pooled, the walked leg's red would win the shared stretch and this
      // would read red 600 / blue 300.
    ).toEqual({ red: 300, blue: 600 });
  });

  // A leg nobody asked about — a car's, an OSRM one, a manual one — is no data,
  // not a claim that there is no trail there. It leaves the legend rather than
  // swelling Unmarked, and the line draws it in the neutral no-data style.
  it('draws a stretch nothing reported as no data, not as Unmarked', () => {
    // The line runs ~223 m; only its first 100 m is valued, as a car leg
    // following a walked one would leave it.
    const partly = line(COORDS, {
      [PATH_DETAILS_PROP]: {
        hiking_colours: [{ start: 0, end: 100, value: String(RED) }],
      },
    });

    expect(
      Object.fromEntries(
        trailColorColorizer.categories!([partly], colorizerMessages).map(
          ({ key, meters }) => [key, Math.round(meters)],
        ),
      ),
    ).toEqual({ red: 100 });

    expect(trailColorColorizer.compute([partly])[0]!.some((p) => p.gap)).toBe(
      true,
    );

    // But a line nothing was reported for at all — a car or OSRM route the mode
    // was never asked about — is left to the plain route line, not faded whole.
    expect(trailColorColorizer.compute([line(COORDS)])).toEqual([]);

    expect(
      trailColorColorizer.categories!([line(COORDS)], colorizerMessages),
    ).toEqual([]);

    // A mode that answers for the whole line keeps counting holes as Unknown.
    expect(
      Object.fromEntries(
        colorizers.surface.categories!([partly], colorizerMessages).map(
          ({ key }) => [key, true],
        ),
      ),
    ).toEqual({ unknown: true });
  });

  // Unmarked is an answer, so it must not wear the no-data grey (#808080). It
  // is `other`'s grey at 50 %, which the palette can only carry blended.
  it('paints Unmarked a grey of its own', () => {
    const swatches = Object.fromEntries(
      trailColorColorizer.categories!(
        [marked(...even(0, OTHER))],
        colorizerMessages,
      ).map(({ key, color }) => [key, color]),
    );

    expect(swatches).toEqual({
      unknown: 'rgb(208 208 208)',
      other: 'rgb(160 160 160)',
    });

    expect(swatches['unknown']).not.toBe(NO_DATA_COLOR);
  });

  // The bit table mirrors a server-side enum. A value added there must degrade
  // to "a colour we cannot name", not to "no marking here".
  it('counts a bit it does not know as `other`', () => {
    expect(shares([1 << 12, SPAN])).toEqual({ other: SPAN });

    expect(shares([RED | (1 << 12), SPAN])).toEqual({ red: SPAN });
  });

  // `other` is a colour that could not be named, so it never stands in for one
  // that could — not even when staying `other` would keep the line unbroken.
  it('never paints `other` over a named colour sharing the stretch', () => {
    expect(shares([OTHER, 500], [OTHER | RED, 200], [RED, 100])).toEqual({
      other: 500,
      red: 300,
    });

    // The Košice case: a red trail sharing 447 m with an unnameable one, run up
    // to and away from by `other` and unmarked stretches, which changing colour
    // twice to draw red would otherwise lose to.
    expect(shares([0, 39], [OTHER, 19], [OTHER | RED, 447], [0, 48])).toEqual({
      unknown: 87,
      other: 19,
      red: 447,
    });
  });
});

// What the map's Hotline reads off a palette itself, for the readers that have
// to spell a colour out — the elevation chart's gradient fill.
describe('paletteColorAt', () => {
  const palette: HotlinePalette = [
    { r: 0, g: 0, b: 0, t: 0 },
    { r: 255, g: 0, b: 0, t: 0.5 },
    { r: 255, g: 255, b: 255, t: 1 },
  ];

  it('reads a stop exactly', () => {
    expect(paletteColorAt(palette, 0.5)).toEqual([255, 0, 0]);
  });

  it('interpolates between the two stops a value falls between', () => {
    expect(paletteColorAt(palette, 0.25)).toEqual([128, 0, 0]);

    expect(paletteColorAt(palette, 0.75)).toEqual([255, 128, 128]);
  });

  it('holds the end colours past either end', () => {
    expect(paletteColorAt(palette, -1)).toEqual([0, 0, 0]);

    expect(paletteColorAt(palette, 2)).toEqual([255, 255, 255]);
  });

  it('answers black for a palette with no stops rather than throwing', () => {
    expect(paletteColorAt([], 0.5)).toEqual([0, 0, 0]);
  });

  it('takes the later of two stops at one position, which is how a palette steps', () => {
    const stepped: HotlinePalette = [
      { r: 0, g: 0, b: 0, t: 0 },
      { r: 0, g: 0, b: 0, t: 0.5 },
      { r: 255, g: 255, b: 255, t: 0.5 },
      { r: 255, g: 255, b: 255, t: 1 },
    ];

    expect(paletteColorAt(stepped, 0.6)).toEqual([255, 255, 255]);
  });
});
