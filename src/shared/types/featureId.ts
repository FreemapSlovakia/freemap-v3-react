import z from 'zod';

/**
 * The order the URL names OSM elements in, which a restore reads them back in —
 * so it is also the order anything comparing a map against its restored self has
 * to put them in.
 */
export const osmElementTypes = ['node', 'way', 'relation'] as const;

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

const WmsFeatureIdSchema = z.union([
  z.object({
    type: z.literal('wms'),
    map: z.string(),
    seq: z.number(),
    property: z.string(),
    id: z.union([z.string(), z.number()]),
  }),
  // The identified pair is all-or-nothing, so a half of it is not a narrower
  // match but no match at all — this branch drops it rather than storing a
  // `property` with nothing to point at.
  z.object({
    type: z.literal('wms'),
    map: z.string(),
    seq: z.number(),
  }),
]);

const GenericFeatureIdSchema = z.object({
  type: z.literal('other'),
  id: z.union([z.string(), z.number()]).optional(),
});

export const FeatureIdSchema = z.union([
  OsmFeatureIdSchema,
  WmsFeatureIdSchema,
  GenericFeatureIdSchema,
]);

let syntheticSeq = 0;

/**
 * Distinct per page load, so an id minted now can't be one a saved map already
 * carries — a counter alone restarts at the same numbers every session and would
 * hand a fresh result the id of a restored pin. `Math.random` rather than
 * `crypto`, which this module is imported too widely to risk: it is undefined
 * outside a secure context, and a throw here would be a blank page rather than
 * one flow gone wrong.
 */
const syntheticPrefix = Math.random().toString(36).slice(2, 10);

/**
 * An id for a result with nothing to be identified by: raw coordinates, a
 * bounding box, a tile, pasted GeoJSON, a geocoding hit that came without an
 * OSM element. Every call answers a different one, because results sharing an
 * id are the same result to everything that keeps them — one takes the other's
 * place on the map when it is picked.
 *
 * The URL carries OSM elements and nothing else, so one of these is never read
 * back from there. A saved map does carry them, which is what makes a pin the
 * URL can't name survive being reopened — and why they have to outlast the
 * session that minted them.
 */
export function syntheticFeatureId(): GenericFeatureId {
  syntheticSeq += 1;

  return { type: 'other', id: `${syntheticPrefix}-${syntheticSeq}` };
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
