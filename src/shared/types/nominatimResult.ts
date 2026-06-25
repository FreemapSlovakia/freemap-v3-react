import z from 'zod';
import { GeoJSONGeometrySchema } from 'zod-geojson';

export const NominatimResultSchema = z.object({
  osm_id: z.number().optional(),
  osm_type: z.enum(['node', 'way', 'relation']).optional(),
  // Nominatim only includes geojson (requested via polygon_geojson) for results
  // that have geometry; it is absent otherwise.
  geojson: GeoJSONGeometrySchema.optional(),
  lat: z.string(),
  lon: z.string(),
  name: z.string().optional(),
  display_name: z.string(),
  class: z.string(),
  type: z.string(),
  extratags: z.record(z.string(), z.string()).nullish(),
  boundingbox: z
    .tuple([z.string(), z.string(), z.string(), z.string()])
    .optional(),
});

export type NominatimResult = z.infer<typeof NominatimResultSchema>;
