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
import { PROPERTY_PREFIX } from './interpolateLabel.js';

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

function pointLabelValues(
  coords: LatLon,
  props: Record<string, string> | undefined,
): LabelValues {
  const values = withProps(props);

  lazy(values, 'location', () => formatLocationLines(coords));

  return values;
}

/** A feature's values, measured from its GeoJSON geometry. */
export function geometryLabelValues(
  geometry: Geometry | null,
  props: Record<string, string> | undefined,
  locale = getLanguage(),
): LabelValues {
  if (geometry?.type === 'Point') {
    const [lon, lat] = geometry.coordinates;

    return pointLabelValues({ lat: lat!, lon: lon! }, props);
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
