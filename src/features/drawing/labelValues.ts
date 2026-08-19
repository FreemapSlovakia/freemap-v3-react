import { getLanguage } from '@features/l10n/messagesStore.js';
import {
  type AreaUnit,
  formatArea,
  naturalAreaUnit,
} from '@shared/areaFormatter.js';
import {
  formatDistance,
  formatLength,
  type LengthUnit,
} from '@shared/distanceFormatter.js';
import { bearingTo, formatLocationLines } from '@shared/geoutils.js';
import { interpolateLabel } from './interpolateLabel.js';
import {
  lineLength,
  measuredRings,
  ringsArea,
  ringsPerimeter,
} from './measureLine.js';
import type { DrawnLine, Line } from './model/actions/drawingLineActions.js';
import type { DrawingPoint } from './model/actions/drawingPointActions.js';

/**
 * What a `{key}` in a label can name: the feature's own properties, plus the
 * values the app works out from its geometry.
 *
 * Resolving a label goes through here and nowhere else. A label is drawn on the
 * map, written into a GeoJSON `title` and a GPX `<name>`, and read by the
 * toposcope — and a key that resolves in one of those and not the others is the
 * failure this exists to prevent: it looks right on screen and comes out as
 * `{location}` in the file.
 */
export type LabelValues = Record<string, string | undefined>;

/**
 * Measuring a line means walking every one of its points, and most labels never
 * ask. Defined as a getter so the work happens for the keys a label actually
 * names — a five-thousand-point line redrawn on every hover would otherwise be
 * measured each time for nothing.
 */
function lazy(values: LabelValues, key: string, get: () => string): void {
  // A property of the same name wins: it is the user's own data, and a label
  // naming it means the value they typed.
  if (Object.hasOwn(values, key)) {
    return;
  }

  Object.defineProperty(values, key, { get, enumerable: true });
}

export function pointLabelValues(
  point: Pick<DrawingPoint, 'coords' | 'props'>,
): LabelValues {
  const values: LabelValues = { ...point.props };

  lazy(values, 'location', () => formatLocationLines(point.coords));

  return values;
}

/**
 * A line's or polygon's computed values. `lines` is the whole collection, which
 * a polygon needs to find the holes belonging to it; without it a polygon is
 * measured as its outline alone.
 */
export function lineLabelValues(
  line: Pick<Line, 'props' | 'points' | 'type'> &
    Partial<Pick<DrawnLine, 'id' | 'holeOfId'>>,
  lines: readonly DrawnLine[] = [],
): LabelValues {
  const values: LabelValues = { ...line.props };

  const locale = getLanguage();

  // Each measurement is taken at most once however many keys name it.
  let rings: ReturnType<typeof measuredRings> | undefined;

  const measured = () =>
    (rings ??= measuredRings(
      { id: line.id ?? -1, points: line.points, holeOfId: line.holeOfId },
      lines,
    ));

  const polygonish = line.type === 'polygon';

  // A polygon's length is the way round it, which is what its readout calls the
  // perimeter — the same number under both names rather than two words for it.
  const lengthM = () =>
    polygonish ? ringsPerimeter(measured()) : lineLength(line);

  lazy(values, 'length', () => formatDistance(lengthM(), locale));
  lazy(values, 'perimeter', () => formatDistance(lengthM(), locale));

  for (const unit of ['m', 'km', 'mi'] satisfies LengthUnit[]) {
    lazy(values, `length_${unit}`, () => formatLength(lengthM(), unit, locale));

    lazy(values, `perimeter_${unit}`, () =>
      formatLength(lengthM(), unit, locale),
    );
  }

  if (polygonish) {
    const areaM2 = () => ringsArea(measured());

    lazy(values, 'area', () =>
      formatArea(areaM2(), naturalAreaUnit(areaM2()), locale),
    );

    for (const [key, unit] of [
      ['area_m2', 'm²'],
      ['area_a', 'a'],
      ['area_ha', 'ha'],
      ['area_km2', 'km²'],
    ] satisfies [string, AreaUnit][]) {
      lazy(values, key, () => formatArea(areaM2(), unit, locale));
    }
  } else if (line.points.length === 2) {
    // Only where there is one direction to give: a line with a bend has several.
    lazy(values, 'azimuth', () =>
      new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: 'degree',
        unitDisplay: 'narrow',
        maximumFractionDigits: 0,
      }).format(bearingTo(line.points[0]!, line.points[1]!)),
    );
  }

  return values;
}

/** A drawn point's label as it should read, wherever it is being read. */
export function drawingPointLabel(
  point: Pick<DrawingPoint, 'coords' | 'label' | 'props'>,
): string {
  return interpolateLabel(point.label ?? '', pointLabelValues(point));
}

/** The same for a line or a polygon. */
export function drawingLineLabel(
  line: Pick<Line, 'label' | 'props' | 'points' | 'type'> &
    Partial<Pick<DrawnLine, 'id' | 'holeOfId'>>,
  lines: readonly DrawnLine[] = [],
): string {
  return interpolateLabel(line.label ?? '', lineLabelValues(line, lines));
}
