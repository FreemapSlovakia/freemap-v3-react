import type { Node, OsmMapping } from '@osm/types.js';

export type ObjectCategory = {
  name: string;
  /**
   * The `key=value` pairs, comma-joined — what `objectsSetFilter` holds and one
   * search filter is built from.
   */
  key: string;
  tags: { key: string; value?: string }[];
};

/**
 * The POI categories the objects tool offers, read off the localized
 * tag-to-name mapping: every named leaf of it is one category.
 */
export function objectCategories(osmMapping: OsmMapping): ObjectCategory[] {
  const res: ObjectCategory[] = [];

  function push(name: string, tags: { key: string; value?: string }[]) {
    res.push({
      name,
      tags,
      key: tags.map((tag) => `${tag.key}=${tag.value}`).join(','),
    });
  }

  function rec(n: Node, tags: { key: string; value: string }[], key?: string) {
    for (const [tagKeyOrValue, nodeOrName] of Object.entries(n)) {
      if (nodeOrName === '{}') {
        continue;
      }

      if (typeof nodeOrName === 'string') {
        if (key && tagKeyOrValue === '*') {
          continue;
        }

        push(
          nodeOrName.replace('{}', '').trim(),
          !key && tagKeyOrValue === '*'
            ? tags
            : [
                ...tags,
                key ? { key, value: tagKeyOrValue } : { key: tagKeyOrValue },
              ],
        );
      } else if (key) {
        rec(nodeOrName, [...tags, { key, value: tagKeyOrValue }]);
      } else {
        rec(nodeOrName, tags, tagKeyOrValue);
      }
    }
  }

  rec(osmMapping.osmTagToNameMapping, []);

  return res;
}
