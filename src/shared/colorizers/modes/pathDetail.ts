import { cumulativeDistances, lowerBound } from '@shared/geoutils.js';
import { length } from '@turf/length';
import {
  type CategoryShare,
  type ColorizedPoint,
  type Colorizer,
  type HotlinePalette,
  type PathDetailSpan,
  readPathDetails,
  rgbCss,
} from '../colorize.js';
import type { ColorizerMessages } from '../translations/ColorizerMessages.js';

type Category = {
  key: string;
  /** The router values that fall into it. */
  values: string[];
  color: [r: number, g: number, b: number];
};

/** What a categorical mode paints and how its legend labels itself. */
type CategoricalSpec = {
  /** The path detail it reads, as GraphHopper names it. */
  detail: string;
  categories: Category[];
  labels: (cm: ColorizerMessages) => Record<string, string>;
};

/**
 * Every mode's last category: `missing`, or a value the router can't name. A
 * category rather than a gap — a gap splits the line into a layer per run, and
 * a route changes surface hundreds of times. Grey, matching `NO_DATA_COLOR`.
 */
const unknown: Category = {
  key: 'unknown',
  values: [],
  color: [128, 128, 128],
};

/** Slack, in metres, before a hole between two stretches counts as one. */
const coverageSlack = 0.5;

/**
 * Colorizes by a path detail: the line takes each stretch's color and changes it
 * at the exact metre the router's value changes, on the spot rather than
 * blending across the segment that spans the boundary.
 */
export function categoricalColorizer(spec: CategoricalSpec): Colorizer {
  const categories = [...spec.categories, unknown];

  const indexOf = new Map<string, number>();

  categories.forEach((category, i) => {
    for (const value of category.values) {
      indexOf.set(value, i);
    }
  });

  const last = categories.length - 1;

  const colorOf = (index: number) => (last === 0 ? 0 : index / last);

  // Each category sits exactly on a palette stop, so a point drawn at its own
  // `t` comes out as that color rather than a blend of the two around it.
  const palette: HotlinePalette = categories.map(({ color }, i) => ({
    r: color[0],
    g: color[1],
    b: color[2],
    t: colorOf(i),
  }));

  /**
   * The stretches of a line in painting order, holes included. A route need not
   * be all the router's own — a manual leg carries no detail, and a leg ridden
   * by another profile carries only what that one asked for — and what nothing
   * covers is Unknown, or the line would go undrawn there.
   */
  function* covering(
    spans: PathDetailSpan[],
    total: number,
  ): Generator<{ start: number; end: number; index: number }> {
    let covered = 0;

    for (const span of spans) {
      if (span.start > covered + coverageSlack) {
        yield { start: covered, end: span.start, index: last };
      }

      yield {
        start: span.start,
        end: span.end,
        index: indexOf.get(span.value) ?? last,
      };

      covered = Math.max(covered, span.end);
    }

    if (total > covered + coverageSlack) {
      yield { start: covered, end: total, index: last };
    }
  }

  return {
    palette,
    spanBased: true,
    detail: spec.detail,

    // At least one stretch the route can be *named* by. The router values the
    // whole line, `missing` included, so a detail coming back says nothing
    // about whether anything is mapped — and a mode that paints the route grey
    // end to end earns its dropdown slot no better than one with no data.
    isAvailable: (features) =>
      features.some((feature) =>
        readPathDetails(feature, spec.detail)?.some((span) =>
          indexOf.has(span.value),
        ),
      ),

    categories: (features, cm) => {
      const labels: Record<string, string> = {
        ...spec.labels(cm),
        unknown: cm.categories.unknown,
      };

      const meters = new Map<string, number>();

      for (const feature of features) {
        // A line the router valued nothing of is Unknown from end to end, which
        // is what `covering` makes of no stretches at all.
        const spans = readPathDetails(feature, spec.detail) ?? [];

        for (const { start, end, index } of covering(
          spans,
          length(feature, { units: 'meters' }),
        )) {
          const { key } = categories[index]!;

          meters.set(key, (meters.get(key) ?? 0) + (end - start));
        }
      }

      return categories.flatMap(({ key, color }): CategoryShare[] => {
        const m = meters.get(key);

        return m
          ? [
              {
                key,
                meters: m,
                color: rgbCss(color),
                label: labels[key] ?? key,
              },
            ]
          : [];
      });
    },

    compute: (features) =>
      features.flatMap((feature) => {
        // No stretches means Unknown end to end, not an undrawn line: the plain
        // route has stepped aside for this one, so a gap would be a hole.
        const spans = readPathDetails(feature, spec.detail) ?? [];

        const coordinates = feature.geometry.coordinates;

        if (coordinates.length < 2) {
          return [];
        }

        const cum = cumulativeDistances(coordinates);

        // One list for the whole line, not one per stretch: each list drawn
        // becomes its own canvas layer, and a route has hundreds of stretches.
        const points: ColorizedPoint[] = [];

        for (const { start, end, index } of covering(
          spans,
          cum[cum.length - 1] ?? 0,
        )) {
          const color = colorOf(index);

          for (const point of spanPoints(coordinates, cum, start, end)) {
            points.push({ ...point, color });
          }
        }

        return points.length < 2 ? [] : [points];
      }),
  };
}

/**
 * The line between two distances along it. Both ends are interpolated, so
 * neighbouring stretches meet on one coordinate: the zero-length segment between
 * their two colors paints nothing, which is what makes the change a hard edge.
 */
function spanPoints(
  coordinates: number[][],
  cum: number[],
  start: number,
  end: number,
): Omit<ColorizedPoint, 'color'>[] {
  const points: Omit<ColorizedPoint, 'color'>[] = [at(coordinates, cum, start)];

  for (let i = indexAt(cum, start); i < cum.length && cum[i]! < end; i++) {
    if (cum[i]! > start) {
      points.push({ lat: coordinates[i]![1]!, lon: coordinates[i]![0]! });
    }
  }

  points.push(at(coordinates, cum, end));

  return points;
}

/** The first vertex at or past `meters`, as an index that always has a vertex
 *  before it and a vertex at it. */
const indexAt = (cum: number[], meters: number) =>
  Math.min(
    cum.length - 1,
    Math.max(
      1,
      lowerBound(cum.length, (i) => cum[i]! >= meters),
    ),
  );

/** The point a given distance along the line. */
function at(
  coordinates: number[][],
  cum: number[],
  meters: number,
): Omit<ColorizedPoint, 'color'> {
  const i = indexAt(cum, meters);

  const a = coordinates[i - 1]!;

  const b = coordinates[i]!;

  const length = cum[i]! - cum[i - 1]!;

  const f =
    length > 0 ? Math.min(1, Math.max(0, (meters - cum[i - 1]!) / length)) : 0;

  return {
    lat: a[1]! + (b[1]! - a[1]!) * f,
    lon: a[0]! + (b[0]! - a[0]!) * f,
  };
}
