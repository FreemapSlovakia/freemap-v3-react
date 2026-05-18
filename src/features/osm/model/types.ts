import z from 'zod';

const OsmElementSchema = z.object({
  id: z.number(),
  tags: z.record(z.string(), z.string()).optional(),
});

export const OsmNodeSchema = OsmElementSchema.extend({
  type: z.literal('node'),
  lat: z.number(),
  lon: z.number(),
});

export const OsmWaySchema = OsmElementSchema.extend({
  type: z.literal('way'),
  nodes: z.array(z.number()),
});

export const OsmRelationSchema = OsmElementSchema.extend({
  type: z.literal('relation'),
  members: z.array(
    z.object({
      type: z.enum(['node', 'way', 'relation']),
      ref: z.number(),
      role: z.string().optional(),
    }),
  ),
});

export const OsmResultSchema = z.object({
  elements: z.array(
    z.discriminatedUnion('type', [
      OsmNodeSchema,
      OsmWaySchema,
      OsmRelationSchema,
    ]),
  ),
});

export type OsmNode = z.infer<typeof OsmNodeSchema>;
export type OsmWay = z.infer<typeof OsmWaySchema>;
export type OsmRelation = z.infer<typeof OsmRelationSchema>;
export type OsmResult = z.infer<typeof OsmResultSchema>;
