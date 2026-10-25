import type { Line } from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingPoint } from '@features/drawing/model/actions/drawingPointActions.js';
import { isClosedRing } from '@shared/geoutils.js';
import { lineStyleFromProperties } from '@shared/styleFromProperties.js';
import type { Feature, FeatureCollection } from 'geojson';
import { fromWire, wireItems } from '../drawingWire.js';
import { closable } from '../featureEditing.js';
import { withCanonicalTimesAll } from '../trackChannels.js';
import { completed } from '../vertexEditing.js';

/**
 * The geometry the properties' line/polygon type asks for: a polygon turned
 * into a line is its outline, open; a line turned into a polygon closes. A
 * closed line typed as a polygon — how GPX carries one — becomes one.
 */
export function withTypedGeometry(feature: Feature): Feature {
  const { geometry } = feature;

  if (geometry.type !== 'Polygon' && geometry.type !== 'LineString') {
    return feature;
  }

  const type = lineStyleFromProperties(
    feature.properties,
    closable(geometry),
  ).type;

  if (geometry.type === 'Polygon' && type === 'line') {
    return {
      ...feature,
      geometry: {
        type: 'LineString',
        coordinates: (geometry.coordinates[0] ?? []).slice(0, -1),
      },
    };
  }

  const coords = geometry.type === 'LineString' ? geometry.coordinates : [];

  if (
    geometry.type === 'LineString' &&
    type === 'polygon' &&
    coords.length > 2
  ) {
    const first = coords[0]!;

    const closed = isClosedRing(coords);

    // A ring has no per-point series; what rode on the line goes with it.
    const { coordinateProperties: _, ...properties } = feature.properties ?? {};

    return {
      ...feature,
      properties,
      geometry: {
        type: 'Polygon',
        coordinates: [closed ? coords : [...coords, first]],
      },
    };
  }

  return feature;
}

/** Features as the store takes them in. */
export function ingest(features: readonly Feature[]): Feature[] {
  return features.map((feature) =>
    feature.geometry?.type === 'LineString' && closable(feature.geometry)
      ? withTypedGeometry(feature)
      : feature.geometry?.type === 'MultiLineString'
        ? // Without the empty segments a file may hold, which no edit expects.
          (completed(feature) ?? feature)
        : feature,
  );
}

/**
 * What a saved map's document puts on the map: its `points` and `lines`, then
 * the rest, which it holds as the viewer's track (`drawingWire.ts`).
 */
export function documentFeatures(
  points: DrawingPoint[] | undefined,
  lines: Line[] | undefined,
  track: FeatureCollection | null | undefined,
  order?: readonly number[],
): Feature[] {
  const listed = [
    ...ingest(
      fromWire(wireItems({ points: points ?? [], lines: lines ?? [] })),
    ),
    ...ingest(track?.features ?? []),
  ];

  // Back where each stood, if `order` places every one exactly once; a
  // document whose parts no longer match it keeps the order it lists.
  const features =
    order?.length === listed.length &&
    new Set(order).size === order.length &&
    order.every((at) => at < listed.length)
      ? order.reduce<Feature[]>((out, at, i) => {
          out[at] = listed[i]!;

          return out;
        }, [])
      : listed;

  return withCanonicalTimesAll({ type: 'FeatureCollection', features })
    .features;
}
