import type { Node, OsmMapping } from '@osm/types.js';

export type ObjectCategory = {
  name: string;
  /**
   * The `key=value` pairs, comma-joined — what `objectsSetFilter` holds and one
   * search filter is built from. A valueless tag is written bare (`building`),
   * meaning the key with any value.
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

  function push(name: string, tags: ObjectCategory['tags']) {
    res.push({
      name,
      tags,
      key: tags
        .map((tag) =>
          tag.value === undefined ? tag.key : `${tag.key}=${tag.value}`,
        )
        .join(','),
    });
  }

  function rec(n: Node, tags: ObjectCategory['tags'], key?: string) {
    for (const [tagKeyOrValue, nodeOrName] of Object.entries(n)) {
      if (typeof nodeOrName === 'string') {
        if (key && tagKeyOrValue === '*') {
          continue;
        }

        const name = nodeOrName.replace('{}', '').trim();

        // An empty mapping is the resolver's deliberate silence — `bridge=no`
        // denies the feature rather than being one to search for.
        if (!name) {
          continue;
        }

        push(
          name,
          !key && tagKeyOrValue === '*'
            ? tags
            : [
                ...tags,
                key ? { key, value: tagKeyOrValue } : { key: tagKeyOrValue },
              ],
        );
      } else if (key) {
        // a `*` branch matches the key with any value
        rec(nodeOrName, [
          ...tags,
          tagKeyOrValue === '*' ? { key } : { key, value: tagKeyOrValue },
        ]);
      } else {
        rec(nodeOrName, tags, tagKeyOrValue);
      }
    }
  }

  rec(osmMapping.osmTagToNameMapping, []);

  return res;
}
