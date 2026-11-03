import { cumulativeDistances, lowerBound } from '@shared/geoutils.js';
import { clamp } from '@shared/mathUtils.js';
import { length } from '@turf/length';
import type { Feature, LineString } from 'geojson';
import {
  type CategoryShare,
  type ColorizedPoint,
  type Colorizer,
  type HotlinePalette,
  type PathDetailSpan,
  readPathDetails,
  rgbCss,
  span,
} from '../colorize.js';
import type { ColorizerMessages } from '../translations/ColorizerMessages.js';

type Category = {
  key: string;
  /** The router values that fall into it; omitted where `resolve` answers instead. */
  values?: string[];
  color: [r: number, g: number, b: number];
};

/** What a categorical mode paints and how its legend labels itself. */
type CategoricalSpec = {
  /**
   * The path detail it reads, as GraphHopper names it. Several, where the
   * profile decides which one the route is answered with; the first the line
   * carries is the one read.
   */
  detail: string | string[];
  categories: Category[];
  /**
   * The category of each stretch, resolved as one ordered list so a choice can
   * depend on its neighbours'; `undefined` where none names it. `detail` is the
   * key it came from — two keys are two series on one line, not one.
   */
  resolve?: (
    stretches: { value: string; meters: number; detail: string }[],
  ) => (string | undefined)[];
  /**
   * Draw a stretch no span covers as no data rather than as the last category.
   * Off by default: a route changes surface hundreds of times, and every gap is
   * a render layer of its own.
   */
  uncoveredIsNoData?: true;
  /**
   * Colour of the last category, where the mode means something more definite by
   * it than the router having no value and so must not wear the no-data grey the
   * default is. Opaque: the Hotline palette carries no alpha.
   */
  unknownColor?: [r: number, g: number, b: number];
  labels: (cm: ColorizerMessages) => Record<string, string>;
};

/**
 * Every mode's last category: `missing`, or a value the router can't name. A
 * category rather than a gap — a gap splits the line into a layer per run, and
 * a route changes surface hundreds of times. Grey, matching `NO_DATA_COLOR`.
 */
const unknown: Category = {
  key: 'unknown',
  color: [128, 128, 128],
};

/** A stretch, tagged with the path detail it was reported under. */
type SourcedSpan = PathDetailSpan & { detail: string };

/** Slack, in metres, before a hole between two stretches counts as one. */
const coverageSlack = 0.5;

/**
 * A line's stretches in painting order, holes included: each span by its index
 * in `spans`, and what none covers with no index.
 */
function* covering(
  spans: { start: number; end: number }[],
  total: number,
): Generator<{ start: number; end: number; i?: number }> {
  let covered = 0;

  for (const [i, span] of spans.entries()) {
    if (span.start > covered + coverageSlack) {
      yield { start: covered, end: span.start };
    }

    yield { start: span.start, end: span.end, i };

    covered = Math.max(covered, span.end);
  }

  if (total > covered + coverageSlack) {
    yield { start: covered, end: total };
  }
}

/**
 * Colorizes by a path detail: the line takes each stretch's color and changes it
 * at the exact metre the router's value changes, on the spot rather than
 * blending across the segment that spans the boundary.
 */
export function categoricalColorizer(spec: CategoricalSpec): Colorizer {
  const categories = [
    ...spec.categories,
    spec.unknownColor ? { ...unknown, color: spec.unknownColor } : unknown,
  ];

  const indexOfValue = new Map<string, number>();

  const indexOfKey = new Map<string, number>();

  categories.forEach((category, i) => {
    indexOfKey.set(category.key, i);

    for (const value of category.values ?? []) {
      indexOfValue.set(value, i);
    }
  });

  const detailKeys =
    typeof spec.detail === 'string' ? [spec.detail] : spec.detail;

  /**
   * The stretches this line carries, off every key it may have been answered
   * with — a multimodal route asks per segment, so one line holds each key over
   * stretches that never overlap.
   */
  const spansOf = (feature: Feature<LineString>) => {
    const spans = detailKeys
      .flatMap((detail) =>
        (readPathDetails(feature, detail) ?? []).map((span) => ({
          ...span,
          detail,
        })),
      )
      .sort((a, b) => a.start - b.start);

    return spans.length > 0 ? spans : undefined;
  };

  const { resolve } = spec;

  /** The category of each stretch in order, undefined where none names it. */
  const categoriesOf = (spans: SourcedSpan[]): (number | undefined)[] =>
    resolve
      ? resolve(
          spans.map(({ value, start, end, detail }) => ({
            value,
            meters: end - start,
            detail,
          })),
        ).map((key) => (key === undefined ? undefined : indexOfKey.get(key)))
      : spans.map((span) => indexOfValue.get(span.value));

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
   * The stretches of a line by category. A route need not be all the router's
   * own — a manual leg carries no detail — and what nothing covers is Unknown,
   * or the line would go undrawn there.
   */
  function* categorized(
    spans: SourcedSpan[],
    total: number,
  ): Generator<{
    start: number;
    end: number;
    index: number;
    /** Whether the router valued this stretch, as against nothing covering it. */
    reported: boolean;
  }> {
    const indices = categoriesOf(spans);

    for (const { start, end, i } of covering(spans, total)) {
      yield {
        start,
        end,
        index: i === undefined ? last : (indices[i] ?? last),
        reported: i !== undefined,
      };
    }
  }

  // A mode may name the last category itself, where it means something more
  // definite than the router having no value.
  const labelsOf = (cm: ColorizerMessages): Record<string, string> => ({
    unknown: cm.categories.unknown,
    ...spec.labels(cm),
  });

  /** Stretches nothing covered, where this mode draws those as no data. */
  const isNoData = (reported: boolean) =>
    !reported && Boolean(spec.uncoveredIsNoData);

  return {
    palette,
    spanBased: true,
    detail: spec.detail,

    // At least one stretch the route can be *named* by. The router values the
    // whole line, `missing` included, so a detail coming back says nothing
    // about whether anything is mapped — and a mode that paints the route grey
    // end to end earns its dropdown slot no better than one with no data.
    isAvailable: (features) =>
      features.some((feature) => {
        const spans = spansOf(feature);

        return spans
          ? categoriesOf(spans).some((index) => index !== undefined)
          : false;
      }),

    categoryAt: (color, cm) => {
      const { key } = categories[Math.round(color * last)] ?? unknown;

      return labelsOf(cm)[key] ?? key;
    },

    categories: (features, cm) => {
      const labels = labelsOf(cm);

      const meters = new Map<string, number>();

      for (const feature of features) {
        // A line the router valued nothing of is Unknown from end to end, which
        // is what `categorized` makes of no stretches at all.
        const spans = spansOf(feature) ?? [];

        for (const { start, end, index, reported } of categorized(
          spans,
          length(feature, { units: 'meters' }),
        )) {
          // No data is not a category, so it is left out of the legend rather
          // than counted as one — the metres then describe what was valued.
          if (isNoData(reported)) {
            continue;
          }

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
        const spans = spansOf(feature) ?? [];

        // Nothing on this line was valued at all — a car or OSRM route, where
        // the mode was never asked. Leave the route drawn as it is rather than
        // fade the whole of it as no data.
        if (spans.length === 0 && spec.uncoveredIsNoData) {
          return [];
        }

        const coordinates = feature.geometry.coordinates;

        if (coordinates.length < 2) {
          return [];
        }

        const cum = cumulativeDistances(coordinates);

        // One list for the whole line, not one per stretch: each list drawn
        // becomes its own canvas layer, and a route has hundreds of stretches.
        const points: ColorizedPoint[] = [];

        for (const { start, end, index, reported } of categorized(
          spans,
          cum.at(-1) ?? 0,
        )) {
          const color = colorOf(index);

          const gap = isNoData(reported);

          for (const point of spanPoints(coordinates, cum, start, end)) {
            points.push({ ...point, color, ...(gap && { gap }) });
          }
        }

        return points.length < 2 ? [] : [points];
      }),
  };
}

/** What a scalar span mode reads and how it scales it. */
type ScalarSpanSpec = {
  /** The numeric path detail it reads, as GraphHopper names it. */
  detail: string;
  palette: HotlinePalette;
} & (
  | {
      /** Each line runs from its own min to its max, labelled in this unit. */
      unit?: string;
      /** Decimals the legend labels it with; 0 when omitted. */
      digits?: number;
    }
  | {
      /** A fixed scale, so a colour means the same on every route: a value's place, 0 to 1. */
      colorAt: (value: number) => number;
      /** The legend of the fixed scale, labelled by the mode itself. */
      scale: NonNullable<Colorizer['scale']>;
    }
);

/**
 * Colorizes by a numeric path detail. Like {@link categoricalColorizer} it
 * changes colour at the exact metre the value does; a stretch no span covers
 * is no data, since the detail is a number and has no category to fall to.
 */
export function scalarSpanColorizer(spec: ScalarSpanSpec): Colorizer {
  /** A span's value, or undefined for one that is not a number. */
  const spanValue = (span: PathDetailSpan) => {
    const value = Number(span.value);

    return Number.isFinite(value) ? value : undefined;
  };

  // In order, as `covering` walks them; an imported line need not be.
  const spansOf = (feature: Feature<LineString>) =>
    (readPathDetails(feature, spec.detail) ?? [])
      .flatMap((span) => {
        const value = spanValue(span);

        return value === undefined
          ? []
          : [{ start: span.start, end: span.end, value }];
      })
      .sort((a, b) => a.start - b.start);

  const scaleOf = (spans: { value: number }[]): ((value: number) => number) => {
    if ('colorAt' in spec) {
      return spec.colorAt;
    }

    const range = span(spans.map(({ value }) => value));

    return (value) =>
      range ? clamp((value - range.min) / (range.max - range.min), 0, 1) : 0.5;
  };

  return {
    palette: spec.palette,
    spanBased: true,
    detail: spec.detail,
    scale: 'scale' in spec ? spec.scale : undefined,

    isAvailable: (features) =>
      features.some((feature) =>
        readPathDetails(feature, spec.detail)?.some(
          (span) => spanValue(span) !== undefined,
        ),
      ),

    legend:
      'unit' in spec && spec.unit
        ? {
            unit: spec.unit,
            digits: spec.digits,
            values: (feature) => spansOf(feature).map(({ value }) => value),
          }
        : undefined,

    compute: (features) =>
      features.flatMap((feature) => {
        const spans = spansOf(feature);

        const coordinates = feature.geometry.coordinates;

        // Nothing valued: the mode was never asked, so the plain route stands.
        if (spans.length === 0 || coordinates.length < 2) {
          return [];
        }

        const colorOf = scaleOf(spans);

        const cum = cumulativeDistances(coordinates);

        // One list for the whole line; see `categoricalColorizer`.
        const points: ColorizedPoint[] = [];

        for (const { start, end, i } of covering(spans, cum.at(-1) ?? 0)) {
          const value = i === undefined ? undefined : spans[i]!.value;

          const color = value === undefined ? 0.5 : colorOf(value);

          for (const point of spanPoints(coordinates, cum, start, end)) {
            points.push({
              ...point,
              color,
              ...(value === undefined && { gap: true }),
            });
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
