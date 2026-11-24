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

/**
 * The tags in tree order, each after its broader tag and siblings sorted by
 * `compare`; a tag whose broader one is missing, or in a cycle, is a root.
 */
export function tagTree<T extends { id: number; parentId: number | null }>(
  tags: T[],
  compare: (a: T, b: T) => number,
): { tag: T; depth: number }[] {
  const byId = new Map(tags.map((t) => [t.id, t]));

  // On a loop itself; one hanging below a loop stays under its parent.
  const inCycle = (t: T) => {
    const seen = new Set<number>();

    for (let p = t.parentId; p !== null; p = byId.get(p)?.parentId ?? null) {
      if (p === t.id) {
        return true;
      }

      if (seen.has(p)) {
        return false;
      }

      seen.add(p);
    }

    return false;
  };

  const isRoot = (t: T) =>
    t.parentId === null || !byId.has(t.parentId) || inCycle(t);

  const children = Map.groupBy(
    tags.filter((t) => !isRoot(t)),
    (t) => t.parentId!,
  );

  const out: { tag: T; depth: number }[] = [];

  const visit = (siblings: T[], depth: number) => {
    for (const tag of siblings.toSorted(compare)) {
      out.push({ tag, depth });

      visit(children.get(tag.id) ?? [], depth + 1);
    }
  };

  visit(tags.filter(isRoot), 0);

  return out;
}

type RelatedTag = {
  id: number;
  name: string;
  label?: string | null;
  parentId: number | null;
  synonyms: string[];
};

/** A tag's place by the names shown; broader ones broadest first. */
export type TagRelation = {
  broader: string[];
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

  const shownOf = new Map(tags.map((t) => [t.id, t.label ?? t.name]));

  // As placed in the tree, so a cycle never loops.
  const parentOf = new Map(
    tagTree(tags, () => 0).flatMap(({ tag, depth }) =>
      depth ? [[tag.id, tag.parentId!] as const] : [],
    ),
  );

  const childrenOf = Map.groupBy(parentOf.keys(), (id) => parentOf.get(id)!);

  relations = new Map(
    tags.flatMap(({ id, synonyms }) => {
      const broader: string[] = [];

      for (let p = parentOf.get(id); p !== undefined; p = parentOf.get(p)) {
        broader.unshift(shownOf.get(p)!);
      }

      const narrower = (childrenOf.get(id) ?? [])
        .map((c) => shownOf.get(c)!)
        .toSorted(makeLabelComparator(language));

      return broader.length || narrower.length || synonyms.length
        ? [[id, { broader, shown: shownOf.get(id)!, synonyms, narrower }]]
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
