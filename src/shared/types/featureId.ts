import typia from 'typia';
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

export type FeatureId =
  | OsmFeatureId
  | ({
      type: 'wms';
      map: string;
      // TODO also layer?
      seq: number;
    } & ({ property: string; id: number | string } | {}))
  | {
      type: 'other';
      id?: unknown;
    };

export const stringifyFeatureId = typia.json.createStringify<FeatureId>();

export function featureIdsEqual(a: FeatureId, b: FeatureId) {
  return stringifyFeatureId(a) === stringifyFeatureId(b);
}
