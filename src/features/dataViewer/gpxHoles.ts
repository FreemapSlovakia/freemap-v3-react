import type { FM_TAGS } from '@features/mapFeaturesExport/model/processors/gpxExporter.js';
import { withoutKeys } from '@shared/featureProperties.js';
import { isClosedRing } from '@shared/geoutils.js';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  Position,
} from 'geojson';
import { withTypedGeometry } from './model/collection.js';

type FmKey = `freemap:${(typeof FM_TAGS)[number]}`;

const POLYGON_ID: FmKey = 'freemap:polygonId';

const HOLE_OF: FmKey = 'freemap:holeOf';

const IDS = [POLYGON_ID, HOLE_OF];

type Fc = FeatureCollection<Geometry | null>;

type F = Fc['features'][number];

type Parent = { polygon: Feature<Polygon>; rings: Position[][] };

const hasIds = (feature: F) =>
  IDS.some((key) => feature.properties?.[key] !== undefined);

/** The polygon a closed GPX track typed as one makes, else nothing. */
function asPolygon(feature: F): Feature<Polygon> | undefined {
  if (feature.geometry?.type !== 'LineString') {
    return undefined;
  }

  const typed = withTypedGeometry(feature as Feature);

  const { geometry } = typed;

  return geometry.type === 'Polygon' ? { ...typed, geometry } : undefined;
}

/** A hole track's ring, closed: `fm:holeOf` says what it is, whatever its style. */
function holeRing(feature: F): Position[] | undefined {
  const coords =
    feature.geometry?.type === 'LineString'
      ? feature.geometry.coordinates
      : undefined;

  return !coords || coords.length < 3
    ? undefined
    : isClosedRing(coords)
      ? coords
      : [...coords, coords[0]!];
}

/**
 * Folds the hole tracks our GPX export writes back into their polygon as
 * interior rings, pairing `fm:holeOf` with `fm:polygonId`; an unpaired one
 * stays a feature of its own. The ids are dropped either way.
 */
export function withGpxHoles(fc: Fc): Fc {
  if (!fc.features.some(hasIds)) {
    return fc;
  }

  // `null` where several polygons claim an id, as older exports' indexes do in
  // a merged file: which one a hole belongs to is then unknown.
  const byId = new Map<string, Parent | null>();

  const parents: (Parent | undefined)[] = [];

  for (const [at, feature] of fc.features.entries()) {
    const id = feature.properties?.[POLYGON_ID];

    const polygon =
      typeof id === 'string' && feature.properties?.[HOLE_OF] === undefined
        ? asPolygon(feature)
        : undefined;

    if (typeof id === 'string' && polygon) {
      const parent = { polygon, rings: [] };

      byId.set(id, byId.has(id) ? null : parent);

      parents[at] = parent;
    }
  }

  const folded = new Set<number>();

  for (const [at, feature] of fc.features.entries()) {
    const of = feature.properties?.[HOLE_OF];

    const parent = typeof of === 'string' ? byId.get(of) : undefined;

    const ring = parent && holeRing(feature);

    if (ring) {
      parent.rings.push(ring);

      folded.add(at);
    }
  }

  return {
    ...fc,
    features: fc.features.flatMap((feature, at): F[] => {
      if (folded.has(at)) {
        return [];
      }

      const parent = parents[at];

      const holed = parent?.rings.length ? parent : undefined;

      const base: F = holed
        ? {
            ...holed.polygon,
            geometry: {
              type: 'Polygon',
              coordinates: [
                ...holed.polygon.geometry.coordinates,
                ...holed.rings,
              ],
            },
          }
        : feature;

      return [
        hasIds(base)
          ? { ...base, properties: withoutKeys(base.properties, IDS) }
          : base,
      ];
    }),
  };
}
