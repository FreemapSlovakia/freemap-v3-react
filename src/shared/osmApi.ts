import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import z from 'zod';
import { GeoJSON2DGeometrySchema, GeoJSON2DPointSchema } from 'zod-geojson';
import type { CancelTriggers } from './cancelRegister.js';
import type { OsmFeatureId } from './types/featureId.js';

/**
 * Freemap's own OSM query API (`freemap-osm-api`), which answers the two
 * queries the app makes of OSM data: what is in a box, and what is at a point.
 */
const baseUrl = process.env['FM_OSM_API_URL'];

const OsmApiFeatureSchema = z.object({
  type: z.literal('Feature'),
  /** `node/123`, `way/123` or `relation/123`. */
  id: z.string(),
  /** Of the whole geometry — the point geometry is only its label point. */
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  geometry: GeoJSON2DPointSchema,
  properties: z.record(z.string(), z.string()),
});

export type OsmApiFeature = z.infer<typeof OsmApiFeatureSchema>;

const FeaturesResponseSchema = z.object({
  /** The limit was reached, so this is an arbitrary subset of the matches. */
  truncated: z.boolean(),
  features: z.array(OsmApiFeatureSchema),
});

const NearbyFeatureSchema = z.object({
  ...OsmApiFeatureSchema.shape,
  /**
   * Meters from the queried point to the geometry. Optional because the list
   * arrives ordered and nothing here reads it — a lookup should not fail whole
   * over a field it does not use.
   */
  distance: z.number().optional(),
});

export type OsmApiNearbyFeature = z.infer<typeof NearbyFeatureSchema>;

const ContainingFeatureSchema = z.object({
  ...OsmApiFeatureSchema.shape,
  /** Square meters; optional for the same reason as `distance`. */
  area: z.number().optional(),
});

export type OsmApiContainingFeature = z.infer<typeof ContainingFeatureSchema>;

const OsmApiFullFeatureSchema = z.object({
  ...OsmApiFeatureSchema.omit({ geometry: true }).shape,
  /** The object itself, not its label point: a point, line, area or collection. */
  geometry: GeoJSON2DGeometrySchema,
});

export type OsmApiFullFeature = z.infer<typeof OsmApiFullFeatureSchema>;

const FeaturesByIdResponseSchema = z.object({
  features: z.array(OsmApiFullFeatureSchema),
});

const FeaturesAtResponseSchema = z.object({
  nearby: z.object({ features: z.array(NearbyFeatureSchema) }),
  containing: z.object({ features: z.array(ContainingFeatureSchema) }),
});

type Request = CancelTriggers & { getState: () => RootState };

async function get(
  path: string,
  params: URLSearchParams,
  request: Request,
): Promise<unknown> {
  const res = await httpRequest({
    ...request,
    url: `${baseUrl}${path}?${params}`,
    expectedStatus: 200,
  });

  return res.json();
}

/**
 * Objects in a bounding box. Each filter is a comma-separated set of `key=v`,
 * `key` or `!key` predicates, ANDed; the filters themselves are ORed.
 */
export async function fetchFeaturesInBbox(
  {
    bbox,
    filters,
    limit,
  }: {
    bbox: { south: number; west: number; north: number; east: number };
    filters: string[];
    limit: number;
  },
  request: Request,
) {
  const params = new URLSearchParams({
    bbox: [bbox.west, bbox.south, bbox.east, bbox.north].join(','),
    limit: String(limit),
  });

  for (const filter of filters) {
    params.append('f', filter);
  }

  return FeaturesResponseSchema.parse(
    await get('/v1/features', params, request),
  );
}

/**
 * What is at a point: objects within `radius` meters, nearest first, and the
 * areas the point falls in, smallest first.
 */
export async function fetchFeaturesAt(
  {
    lat,
    lon,
    radius,
    keys,
  }: { lat: number; lon: number; radius: number; keys: readonly string[] },
  request: Request,
) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius: String(radius),
    keys: keys.join(','),
  });

  return FeaturesAtResponseSchema.parse(
    await get('/v1/features/at', params, request),
  );
}

/**
 * The elements named by id, each with its own geometry rather than a label
 * point — the caller draws them.
 *
 * One request answers any number of them, and an id the database doesn't hold
 * is simply absent from the result: the import keeps only tagged objects, and
 * only within its region. Telling which of a batch came back is the caller's
 * job, since only it knows what a missing one means.
 */
export async function fetchOsmFeaturesById(
  ids: readonly OsmFeatureId[],
  request: Request,
): Promise<Map<string, OsmApiFullFeature>> {
  if (ids.length === 0) {
    return new Map();
  }

  const byId = new Map<string, OsmApiFullFeature>();

  // Well under both the route's own limit and what a URL can carry: `/` and
  // `,` are percent-encoded, so an id costs ~23 characters and a chunk this
  // size is ~6 kB of query string. Too long a URL fails as a transport error,
  // which nothing here could explain.
  for (let i = 0; i < ids.length; i += 250) {
    const params = new URLSearchParams({
      ids: ids
        .slice(i, i + 250)
        .map(({ elementType, id }) => `${elementType}/${id}`)
        .join(','),
    });

    const { features } = FeaturesByIdResponseSchema.parse(
      await get('/v1/features/by-id', params, request),
    );

    for (const feature of features) {
      byId.set(feature.id, feature);
    }
  }

  return byId;
}

/** `way/123` as the app identifies OSM elements. */
export function osmApiFeatureId(id: string): OsmFeatureId {
  const [elementType, elementId] = id.split('/');

  if (
    (elementType !== 'node' &&
      elementType !== 'way' &&
      elementType !== 'relation') ||
    !elementId
  ) {
    throw new Error(`not an OSM element id: ${id}`);
  }

  return { type: 'osm', elementType, id: Number(elementId) };
}
