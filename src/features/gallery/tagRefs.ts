import { makeLabelComparator, removeAccents } from '@shared/stringUtils.js';
import z from 'zod';
import type { PictureTag } from './model/actions.js';

/** A photo's tag: an existing one by its id, or a new one by the name typed. */
export const TagRefSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
});

export type TagRef = z.infer<typeof TagRefSchema>;

/** A bare string is a tag remembered by its name. */
export const TagRefCompatSchema = z.preprocess(
  (t) => (typeof t === 'string' ? { name: t } : t),
  TagRefSchema,
);

/** A tag name or label as the server compares them: no case, no accents. */
export function tagNameKey(s: string): string {
  return removeAccents(s).toLowerCase().replace(/\s+/g, ' ').trim();
}

/** A picture's tags from the API: by `tagList`, else by name alone. */
export function tagRefsOf(picture: {
  tags: string[];
  tagList?: PictureTag[];
}): TagRef[] {
  return (
    picture.tagList?.map(({ id, name }) => ({ id, name })) ??
    picture.tags.map((name) => ({ name }))
  );
}

/** A string for a key or a select value; a name can look like an id. */
export function tagKey({ id, name }: TagRef): string {
  return id === undefined ? `name:${name}` : `id:${id}`;
}

/** What `tagKey` encodes, by its id or its name. */
export function parseTagKey(
  key: string,
): { id: number } | { name: string } | undefined {
  const id = /^id:(\d+)$/.exec(key)?.[1];

  return id
    ? { id: Number(id) }
    : key.startsWith('name:')
      ? { name: key.slice('name:'.length) }
      : undefined;
}

export function isSameTag(a: TagRef, b: TagRef): boolean {
  return a.id !== undefined && b.id !== undefined
    ? a.id === b.id
    : tagNameKey(a.name) === tagNameKey(b.name);
}

/** A tag, with its synonyms where the list has them. */
type IndexedTag = PictureTag & { synonyms?: string[] };

export interface TagIndex<T extends IndexedTag> {
  byId: Map<number, T>;
  /** By the key of its name or a synonym. */
  byName: Map<string, T>;
  /** By the key of a label or Latin name; several tags may share one. */
  byLabel: Map<string, T[]>;
  /** By id, the keys of the name, synonyms and Latin name, to search in. */
  search: Map<number, string>;
}

const indexes = new WeakMap<IndexedTag[], TagIndex<IndexedTag>>();

/** Lookups over a tag list, built once per list. */
export function tagIndex<T extends IndexedTag>(tags: T[]): TagIndex<T> {
  let index = indexes.get(tags);

  if (!index) {
    const byLabel = new Map<string, IndexedTag[]>();

    for (const tag of tags) {
      for (const s of new Set(
        [tag.label, tag.latin].filter((x) => x).map((x) => tagNameKey(x!)),
      )) {
        byLabel.set(s, [...(byLabel.get(s) ?? []), tag]);
      }
    }

    index = {
      byId: new Map(tags.map((t) => [t.id, t])),
      // Names first, so a synonym never shadows a tag's own name.
      byName: new Map([
        ...tags.flatMap((t) =>
          (t.synonyms ?? []).map((s) => [tagNameKey(s), t] as const),
        ),
        ...tags.map((t) => [tagNameKey(t.name), t] as const),
      ]),
      byLabel,
      search: new Map(
        tags.map((t) => [
          t.id,
          [t.name, ...(t.synonyms ?? []), t.latin ?? '']
            .map(tagNameKey)
            .join('\n'),
        ]),
      ),
    };

    indexes.set(tags, index);
  }

  return index as TagIndex<T>;
}

/**
 * The tag a reference or typed text means: by id; else by name or synonym;
 * else by the label or Latin name of exactly one tag.
 */
export function findTag<T extends IndexedTag>(
  tags: T[],
  ref: TagRef,
): T | undefined {
  const { byId, byName, byLabel } = tagIndex(tags);

  const key = tagNameKey(ref.name);

  const labelled = byLabel.get(key);

  return (
    (ref.id === undefined ? undefined : byId.get(ref.id)) ??
    byName.get(key) ??
    (labelled?.length === 1 ? labelled[0] : undefined)
  );
}

type TreeTag = { id: number; parentIds: number[] };

/** Its broader tags that are in the list. */
function parentsIn<T extends TreeTag>(byId: Map<number, T>, tag: T): number[] {
  return tag.parentIds.filter((p) => p !== tag.id && byId.has(p));
}

/**
 * The tags in tree order, under each of their broader tags, siblings sorted by
 * `compare`. A cycle is cut where a tag recurs on its path; one reachable only
 * through a cycle is a root.
 */
export function tagTree<T extends TreeTag>(
  tags: T[],
  compare: (a: T, b: T) => number,
): { tag: T; depth: number; key: string }[] {
  const byId = new Map(tags.map((t) => [t.id, t]));

  const children = new Map<number, T[]>();

  for (const tag of tags) {
    for (const p of parentsIn(byId, tag)) {
      children.set(p, [...(children.get(p) ?? []), tag]);
    }
  }

  const out: { tag: T; depth: number; key: string }[] = [];

  const placed = new Set<number>();

  const visit = (
    siblings: T[],
    depth: number,
    path: Set<number>,
    prefix: string,
  ) => {
    for (const tag of siblings.toSorted(compare)) {
      if (path.has(tag.id)) {
        continue;
      }

      const key = `${prefix}/${tag.id}`;

      out.push({ tag, depth, key });

      placed.add(tag.id);

      visit(
        children.get(tag.id) ?? [],
        depth + 1,
        new Set(path).add(tag.id),
        key,
      );
    }
  };

  visit(
    tags.filter((t) => parentsIn(byId, t).length === 0),
    0,
    new Set(),
    '',
  );

  // Whether its broader tags lead back to it.
  const onCycle = (tag: T) => {
    const seen = new Set<number>();

    const stack = parentsIn(byId, tag);

    while (stack.length) {
      const id = stack.pop()!;

      if (id === tag.id) {
        return true;
      }

      if (!seen.has(id)) {
        seen.add(id);

        stack.push(...parentsIn(byId, byId.get(id)!));
      }
    }

    return false;
  };

  // A cycle's tags as roots, so one hanging below it stays in its place.
  for (const pass of [onCycle, () => true]) {
    for (const tag of tags.toSorted(compare)) {
      if (!placed.has(tag.id) && pass(tag)) {
        visit([tag], 0, new Set(), '');
      }
    }
  }

  return out;
}

type RelatedTag = TreeTag & {
  name: string;
  label?: string | null;
  synonyms: string[];
};

/** Paths shown in a tooltip; more end in "…". */
const MAX_PATHS = 4;

/**
 * A tag's place by the names shown: each path from a root, broadest first,
 * without the tag itself.
 */
export type TagRelation = {
  paths: string[][];
  morePaths: boolean;
  shown: string;
  synonyms: string[];
  narrower: string[];
};

const relationCache = new WeakMap<RelatedTag[], Map<number, TagRelation>>();

/**
 * By id, the tags with broader or narrower ones or synonyms; built once per
 * list, which is fetched anew for another `language`.
 */
export function tagRelations(
  tags: RelatedTag[],
  language: string,
): Map<number, TagRelation> {
  let relations = relationCache.get(tags);

  if (relations) {
    return relations;
  }

  const byId = new Map(tags.map((t) => [t.id, t]));

  const shownOf = (id: number) => {
    const t = byId.get(id)!;

    return t.label ?? t.name;
  };

  const compare = makeLabelComparator(language);

  const childrenOf = new Map<number, number[]>();

  for (const tag of tags) {
    for (const p of parentsIn(byId, tag)) {
      childrenOf.set(p, [...(childrenOf.get(p) ?? []), tag.id]);
    }
  }

  // Up to one past the limit, to know there are more.
  const pathsOf = (tag: RelatedTag) => {
    const paths: number[][] = [];

    // Paths cut short by a cycle, shown only when no path reaches a root.
    const cut: number[][] = [];

    // `above`: the path so far, nearest first.
    const up = (id: number, above: number[]) => {
      // Both bounded: a cluster of cycles has paths without end.
      if (paths.length > MAX_PATHS || cut.length > MAX_PATHS) {
        return;
      }

      const all = parentsIn(byId, byId.get(id)!);

      const parents = all.filter((p) => p !== tag.id && !above.includes(p));

      if (parents.length === 0) {
        if (above.length) {
          (all.length ? cut : paths).push(above.toReversed());
        }

        return;
      }

      for (const p of parents) {
        up(p, [...above, p]);
      }
    };

    up(tag.id, []);

    return (paths.length ? paths : cut)
      .map((path) => path.map(shownOf))
      .toSorted((a, b) => compare(a.join(' '), b.join(' ')));
  };

  relations = new Map(
    tags.flatMap((tag) => {
      const paths = pathsOf(tag);

      const narrower = (childrenOf.get(tag.id) ?? [])
        .map(shownOf)
        .toSorted(compare);

      return paths.length || narrower.length || tag.synonyms.length
        ? [
            [
              tag.id,
              {
                paths: paths.slice(0, MAX_PATHS),
                morePaths: paths.length > MAX_PATHS,
                shown: shownOf(tag.id),
                synonyms: tag.synonyms,
                narrower,
              },
            ],
          ]
        : [];
    }),
  );

  relationCache.set(tags, relations);

  return relations;
}

/**
 * For a request body: existing tags by id, new ones by name. An id not in the
 * loaded list (merged away meanwhile) goes by its name, so the server finds
 * the tag and the save removes what it should.
 */
export function tagsToWire(
  refs: TagRef[],
  loaded: PictureTag[],
): {
  tagIds: number[];
  tags: string[];
} {
  const { byId } = tagIndex(loaded);

  const known = (id: number | undefined): id is number =>
    id !== undefined && (loaded.length === 0 || byId.has(id));

  return {
    tagIds: refs.flatMap(({ id }) => (known(id) ? [id] : [])),
    tags: refs.flatMap(({ id, name }) => (known(id) ? [] : [name])),
  };
}
