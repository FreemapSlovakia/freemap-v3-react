import { removeAccents } from '@shared/stringUtils.js';
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

export interface TagIndex<T extends PictureTag> {
  byId: Map<number, T>;
  byName: Map<string, T>;
  /** By the key of a label or Latin name; several tags may share one. */
  byLabel: Map<string, T[]>;
  /** By id, the keys of the name and Latin name, to search in. */
  search: Map<number, string>;
}

const indexes = new WeakMap<PictureTag[], TagIndex<PictureTag>>();

/** Lookups over a tag list, built once per list. */
export function tagIndex<T extends PictureTag>(tags: T[]): TagIndex<T> {
  let index = indexes.get(tags);

  if (!index) {
    const byLabel = new Map<string, PictureTag[]>();

    for (const tag of tags) {
      for (const s of new Set(
        [tag.label, tag.latin].filter((x) => x).map((x) => tagNameKey(x!)),
      )) {
        byLabel.set(s, [...(byLabel.get(s) ?? []), tag]);
      }
    }

    index = {
      byId: new Map(tags.map((t) => [t.id, t])),
      byName: new Map(tags.map((t) => [tagNameKey(t.name), t])),
      byLabel,
      search: new Map(
        tags.map((t) => [
          t.id,
          `${tagNameKey(t.name)}\n${t.latin ? tagNameKey(t.latin) : ''}`,
        ]),
      ),
    };

    indexes.set(tags, index);
  }

  return index as TagIndex<T>;
}

/**
 * The tag a reference or typed text means: by id; else by name; else by the
 * label or Latin name of exactly one tag.
 */
export function findTag<T extends PictureTag>(
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
