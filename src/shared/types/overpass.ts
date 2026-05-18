import z from 'zod';
import { LatLonSchema } from './common.js';

export const OverpassBoundsSchema = z.object({
  minlat: z.number(),
  minlon: z.number(),
  maxlat: z.number(),
  maxlon: z.number(),
});

export type OverpassBounds = z.infer<typeof OverpassBoundsSchema>;

const OverpassElementBaseSchema = z.object({
  id: z.number(),
  tags: z.record(z.string(), z.string()).optional(), // probably bug in overpass, but it returned node without tags
});

const OverpassNodeElementSchema = OverpassElementBaseSchema.extend({
  type: z.literal('node'),
  lat: z.number(),
  lon: z.number(),
});

export const OverpassCenterExtraSchema = z.object({ center: LatLonSchema });

export const OverpassBoundsExtraSchema = z.object({
  bounds: OverpassBoundsSchema,
});

export function overpassResultSchema<E extends z.ZodType>(extraSchema: E) {
  return z.object({
    elements: z.array(
      z.union([
        OverpassNodeElementSchema,
        z.intersection(
          OverpassElementBaseSchema.extend({
            type: z.enum(['way', 'relation']),
          }),
          extraSchema,
        ),
      ]),
    ),
  });
}

export type OverpassResult<E extends z.ZodType> = z.infer<
  ReturnType<typeof overpassResultSchema<E>>
>;

export type OverpassElement<E extends z.ZodType> =
  OverpassResult<E>['elements'][number];
