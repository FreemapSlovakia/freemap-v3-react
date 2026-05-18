import z from 'zod';
import { GeoJSONGeometrySchema } from 'zod-geojson';

export const NominatimResultSchema = z.object({
  osm_id: z.number().optional(),
  osm_type: z.enum(['node', 'way', 'relation']).optional(),
  geojson: GeoJSONGeometrySchema,
  lat: z.string(),
  lon: z.string(),
  name: z.string().optional(),
  display_name: z.string(),
  class: z.string(),
  type: z.string(),
  extratags: z.record(z.string(), z.string()).nullish(),
  boundingbox: z.array(z.string()).length(4).optional(),
});

export type NominatimResult = z.infer<typeof NominatimResultSchema>;
