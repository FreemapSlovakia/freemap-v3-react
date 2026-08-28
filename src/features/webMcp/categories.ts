import { objectCategories } from '@features/objects/objectCategories.js';
import { getOsmMapping } from '@osm/osmNameResolver.js';

/**
 * Only the filters the app itself offers may reach Overpass. The query
 * interpolates them unescaped, so an invented one is not merely a miss: it can
 * carry its own statement, and with it a query no bbox bounds.
 */
export async function assertKnownCategories(
  categories: string[],
  language: string,
): Promise<void> {
  const known = new Set(
    objectCategories(await getOsmMapping(language)).map(
      (category) => category.key,
    ),
  );

  for (const category of categories) {
    if (!known.has(category)) {
      throw new Error(
        `"${category}" is not a category this map knows. Take the filters from list-object-categories.`,
      );
    }
  }
}
