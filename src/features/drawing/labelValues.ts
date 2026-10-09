import { getLanguage } from '@features/l10n/messagesStore.js';
import {
  type AreaUnit,
  areaUnitKeys,
  formatArea,
  naturalAreaUnit,
} from '@shared/areaFormatter.js';
import {
  formatDistance,
  formatLength,
  lengthUnitKeys,
} from '@shared/distanceFormatter.js';
import {
  bearingTo,
  formatAzimuth,
  formatLocationLines,
} from '@shared/geoutils.js';
import type { LatLon } from '@shared/types/common.js';
import { area as turfArea } from '@turf/area';
import { feature } from '@turf/helpers';
import { length as turfLength } from '@turf/length';
import type { Geometry, Position } from 'geojson';
import { interpolateLabel, PROPERTY_PREFIX } from './interpolateLabel.js';
import {
  lineLength,
  measuredRings,
  ringsArea,
  ringsPerimeter,
} from './measureLine.js';
import type { DrawnLine, Line } from './model/actions/drawingLineActions.js';
import type { DrawingPoint } from './model/actions/drawingPointActions.js';

/**
 * What a `{key}` in a label can name. The bare namespace is what the app works
 * out from the geometry — `{area}`, `{length}`, `{location}` — and the feature's
 * own properties live under `p:`, as `{p:name}`.
 *
 * The prefix is required rather than a fallback for names the app doesn't use.
 * Were a bare `{area}` to mean a property called `area` until the day the app
 * learned to measure one, every label already written — and already shared in a
 * URL — would change meaning under its author. This way a computed name added
 * later can only start answering a label that was, until then, visibly
 * unanswered.
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
  Object.defineProperty(values, key, { get, enumerable: true });
}

/** A feature's own properties, under the `p:` namespace a label reaches them by. */
export function withProps(
  props: Record<string, string> | undefined,
): LabelValues {
  return Object.fromEntries(
    Object.entries(props ?? {}).map(([key, value]) => [
      PROPERTY_PREFIX + key,
      value,
    ]),
  );
}

export function pointLabelValues(
  point: Pick<DrawingPoint, 'coords' | 'props'>,
): LabelValues {
  const values = withProps(point.props);

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
  const values = withProps(line.props);

  // Each measurement is taken at most once however many keys name it.
  let rings: ReturnType<typeof measuredRings> | undefined;

  const measured = () =>
    (rings ??= measuredRings(
      { id: line.id ?? -1, points: line.points, holeOfId: line.holeOfId },
      lines,
    ));

  const polygonish = line.type === 'polygon';

  addMeasures(
    values,
    () => (polygonish ? ringsPerimeter(measured()) : lineLength(line)),
    polygonish ? () => ringsArea(measured()) : undefined,
    !polygonish && line.points.length === 2
      ? [line.points[0]!, line.points[1]!]
      : undefined,
    getLanguage(),
  );

  return values;
}

/**
 * An imported feature's values: the keys a drawn one answers, measured from its
 * GeoJSON geometry.
 */
export function geometryLabelValues(
  geometry: Geometry | null,
  props: Record<string, string> | undefined,
  locale = getLanguage(),
): LabelValues {
  if (geometry?.type === 'Point') {
    const [lon, lat] = geometry.coordinates;

    return pointLabelValues({ coords: { lat: lat!, lon: lon! }, props });
  }

  const values = withProps(props);

  switch (geometry?.type) {
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon': {
      const isPolygon =
        geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';

      const ends =
        geometry.type === 'LineString' && geometry.coordinates.length === 2
          ? geometry.coordinates
          : undefined;

      const at = ([lon, lat]: Position): LatLon => ({ lat: lat!, lon: lon! });

      // Every ring counts towards a polygon's length, as `ringsPerimeter` does.
      addMeasures(
        values,
        () => turfLength(feature(geometry), { units: 'meters' }),
        isPolygon ? () => turfArea(geometry) : undefined,
        ends && [at(ends[0]!), at(ends[1]!)],
        locale,
      );
    }
  }

  return values;
}

/**
 * The measured keys. An `areaM2` makes the shape a polygon; `ends` belong to a
 * straight two-point line, the one shape with a single direction to give.
 */
function addMeasures(
  values: LabelValues,
  lengthM: () => number,
  areaM2: (() => number) | undefined,
  ends: readonly [LatLon, LatLon] | undefined,
  locale: string,
): void {
  // A polygon's length is the way round it, which is what its readout calls the
  // perimeter — the same number under both names rather than two words for it.
  lazy(values, 'length', () => formatDistance(lengthM(), locale));
  lazy(values, 'perimeter', () => formatDistance(lengthM(), locale));

  for (const unit of lengthUnitKeys) {
    lazy(values, `length_${unit}`, () => formatLength(lengthM(), unit, locale));

    lazy(values, `perimeter_${unit}`, () =>
      formatLength(lengthM(), unit, locale),
    );
  }

  if (areaM2) {
    lazy(values, 'area', () => {
      const m2 = areaM2();

      return formatArea(m2, naturalAreaUnit(m2), locale);
    });

    for (const [unit, key] of Object.entries(areaUnitKeys) as [
      AreaUnit,
      string,
    ][]) {
      lazy(values, key, () => formatArea(areaM2(), unit, locale));
    }
  } else if (ends) {
    lazy(values, 'azimuth', () =>
      formatAzimuth(bearingTo(ends[0], ends[1]), locale),
    );
  }
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
