import { gpx } from '@tmcw/togeojson';
import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { headingColorizer } from './modes/heading.js';
import { speedColorizer } from './modes/speed.js';
import { STEEPNESS_FULL_SCALE, steepnessColorizer } from './modes/steepness.js';
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

  // The grade a palette position stands for, the inverse of what the colorizer
  // maps with — so a wrongly scaled mapping reads back as the wrong grade
  // rather than merely as a different color.
  function gradeOf(color: number): number {
    return (color - 0.5) * 2 * STEEPNESS_FULL_SCALE;
  }

  it('reads a constant slope back at its own grade', () => {
    for (const grade of [-0.3, -0.1, 0, 0.1, 0.3]) {
      const [points] = steepnessColorizer.compute([slope(grade)]);

      // The ends are measured over a window shifted inward, so only the middle
      // is a clean centered reading.
      for (const point of points!.slice(20, 40)) {
        expect(gradeOf(point.color)).toBeCloseTo(grade, 3);
      }
    }
  });

  it('clamps beyond the scale ends', () => {
    const [down] = steepnessColorizer.compute([
      slope(-STEEPNESS_FULL_SCALE * 2),
    ]);

    const [up] = steepnessColorizer.compute([slope(STEEPNESS_FULL_SCALE * 2)]);

    expect(down![30]!.color).toBe(0);

    expect(up![30]!.color).toBe(1);
  });
});
