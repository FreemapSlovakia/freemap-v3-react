import z from 'zod';

export const OsmFeatureIdSchema = z.object({
  type: z.literal('osm'),
  elementType: z.union([
    z.literal('node'),
    z.literal('way'),
    z.literal('relation'),
  ]),
  id: z.number(),
});

export type OsmFeatureId = z.infer<typeof OsmFeatureIdSchema>;

// Fallback id for synthetic search results that don't have a stable
// external identifier (raw geojson, bbox, tile coords, plain lat/lon,
// nominatim results lacking an osm_id).
export type GenericFeatureId = {
  type: 'other';
  id?: number | string;
};

export type FeatureId =
  | OsmFeatureId
  | ({
      type: 'wms';
      map: string;
      // TODO also layer?
      seq: number;
    } & (
      | { property: string; id: number | string }
      | { property?: undefined; id?: undefined }
    ))
  | GenericFeatureId;

let syntheticSeq = 0;

/**
 * An id for a result with nothing to be identified by: raw coordinates, a
 * bounding box, a tile, pasted GeoJSON, a geocoding hit that came without an
 * OSM element. Every call answers a different one, because results sharing an
 * id are the same result to everything that keeps them — one takes the other's
 * place on the map when it is picked.
 *
 * It only has to hold for as long as the page does. Nothing outside the session
 * reads one: the URL carries OSM elements and nothing else.
 */
export function syntheticFeatureId(): GenericFeatureId {
  syntheticSeq += 1;

  return { type: 'other', id: syntheticSeq };
}

export function stringifyFeatureId(id: FeatureId): string {
  switch (id.type) {
    case 'osm':
      return `osm:${id.elementType}:${id.id}`;
    case 'wms':
      return 'property' in id
        ? `wms:${id.map}:${id.seq}:${id.property}:${id.id}`
        : `wms:${id.map}:${id.seq}`;
    case 'other':
      return `other:${id.id ?? ''}`;
  }
}

export function featureIdsEqual(a: FeatureId, b: FeatureId): boolean {
  return stringifyFeatureId(a) === stringifyFeatureId(b);
}
