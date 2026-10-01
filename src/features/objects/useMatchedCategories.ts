import type { GenericNameLabel } from '@osm/useGenericNameResolver.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';
import type { ObjectCategory } from './objectCategories.js';
import { useObjectCategories } from './useObjectCategories.js';

/** The category whose tags are exactly the ones that made the kind. */
function findCategory(
  categories: ObjectCategory[],
  tags: Record<string, string>,
): ObjectCategory | undefined {
  const keys = Object.keys(tags);

  const matching = categories.filter(
    (category) =>
      category.tags.length === keys.length &&
      category.tags.every(
        ({ key, value }) =>
          key in tags && (value === undefined || tags[key] === value),
      ),
  );

  // A valueless category is the key with any value, so `building` matches
  // `building=church` as well as the church category does — and it comes first.
  // The kind names the narrower one.
  return (
    matching.find((category) =>
      category.tags.every(({ value }) => value !== undefined),
    ) ?? matching[0]
  );
}

export type MatchedCategory = GenericNameLabel & {
  /** Absent where no filter stands for this kind, so it cannot be switched. */
  category?: ObjectCategory;
  /** Unique within the list; two categories can share a localized name. */
  key: string;
};

/** Whether an object carrying `tags` is one the filter `key` asks for. */
function matchesTags(key: string, tags: Record<string, string>): boolean {
  return key.split(',').every((part) => {
    const eq = part.indexOf('=');

    return eq === -1
      ? part in tags
      : tags[part.slice(0, eq)] === part.slice(eq + 1);
  });
}

/** The same filter however its parts were ordered when it was stored. */
export function sameFilter(a: string, b: string): boolean {
  const own = a.split(',');

  const other = b.split(',');

  return (
    own.length === other.length && own.every((part) => other.includes(part))
  );
}

/**
 * The kinds of an object paired with the objects filter each one stands for,
 * plus any active filter that shows the object without naming a kind of it.
 * Shared, so the chips in the details popup and the toolbar's own menu can
 * never disagree about which filter a kind belongs to.
 */
export function useMatchedCategories(
  parts: GenericNameLabel[],
  /** The object's own tags, which say which active filters are showing it. */
  tags?: Record<string, string>,
): MatchedCategory[] {
  const active = useAppSelector((state) => state.objects.active);

  // Nothing here is switchable without a kind resolved from OSM tags or an
  // active filter to name, and without either the mapping is never fetched.
  const categories = useObjectCategories(
    parts.some((part) => part.tags) ||
      (tags !== undefined && active.length > 0),
  );

  return useMemo(() => {
    const kinds: MatchedCategory[] = parts.map((part) => {
      const category = part.tags
        ? findCategory(categories, part.tags)
        : undefined;

      return { ...part, category, key: category?.key ?? part.text };
    });

    if (!tags) {
      return kinds;
    }

    // `eliminateMoreGenericNames` drops the broad kind in favour of the narrow
    // one, so an object the resolver calls a "Refitted spring" names nothing
    // that the `natural=spring` filter showing it could be switched off by.
    const extra = active.flatMap((key) => {
      if (
        !matchesTags(key, tags) ||
        kinds.some(
          (kind) => kind.category && sameFilter(kind.category.key, key),
        )
      ) {
        return [];
      }

      const category = categories.find((item) => sameFilter(item.key, key));

      return category
        ? [{ text: category.name, category, key: category.key }]
        : [];
    });

    return [...kinds, ...extra];
  }, [parts, categories, tags, active]);
}
