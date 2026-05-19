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
    } & ({ property: string; id: number | string } | {}))
  | GenericFeatureId;

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
