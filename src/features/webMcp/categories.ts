import { objectCategories } from '@features/objects/objectCategories.js';
import { getOsmMapping } from '@osm/osmNameResolver.js';

/**
 * Only the filters the app itself offers may be searched for. The API rejects
 * a key it does not index, so this turns a bare 400 into an answer the agent
 * can act on.
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
