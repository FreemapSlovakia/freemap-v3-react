import { getGenericNameFromOsmElementSync } from '@osm/osmNameResolver.js';
import type { OsmMapping } from '@osm/types.js';
import z from 'zod';

/** What the renderer's `/legend` answers. */
export const LegendCatalogueSchema = z.array(
  z.object({
    id: z.string(),
    category: z.string(),
    tags: z.array(z.record(z.string(), z.string())),
  }),
);

/** What the legend calls an item drawn for `tags`. */
export function legendTagsName(
  tags: Record<string, string>,
  { osmTagToNameMapping, colorNames }: OsmMapping,
): string {
  return getGenericNameFromOsmElementSync(
    tags,
    'relation',
    osmTagToNameMapping,
    colorNames,
  );
}

/** The mapping marks the spot a value would go with `*`; it reads as noise. */
export const strippedName = (name: string | undefined) =>
  name?.replace(/\s*\*\s*/g, '') ?? '';
