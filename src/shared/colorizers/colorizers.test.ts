import { gpx } from '@tmcw/togeojson';
import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { type HotlinePalette, paletteColorAt } from './colorize.js';
import { headingColorizer } from './modes/heading.js';
import { speedColorizer } from './modes/speed.js';
import {
  STEEPNESS_DEFAULT_SCALE,
  steepnessColorizer,
  steepnessGradeAt,
} from './modes/steepness.js';
import { timeColorizer } from './modes/time.js';

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
