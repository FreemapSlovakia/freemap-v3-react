import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { useCallback, useMemo } from 'react';
import type { TagSuggestion } from 'react-tag-autocomplete';
import type { GalleryTag } from '../model/actions.js';
import { tagKey, tagNameKey, tagRelations, tagTree } from '../tagRefs.js';

/**
 * A suggestion with what `TagSuggestionOption` shows around its label; the
 * label stays the name shown, which Enter matches exactly.
 */
// TODO: two tags shown alike are labelled "label · name", so typing the bare
// label and Enter offers a new tag (which `findTag` may still resolve).
export type TagTreeSuggestion = TagSuggestion & {
  depth?: number;
  /** The synonym it was found by. */
  synonym?: string;
  /** Its own photos. */
  count?: number;
  /** All the filter finds by it, its narrower tags included. */
  total?: number;
};

function buildTagSuggestions(tags: GalleryTag[], language: string) {
  const shownCounts = Map.groupBy(tags, (t) => t.label ?? t.name);

  const compare = makeLabelComparator(language);

  // Two tags shown alike are told apart by their names.
  const shownOf = new Map(
    tags.map(({ id, name, label }) => [
      id,
      label && (shownCounts.get(label)?.length ?? 0) > 1
        ? `${label} · ${name}`
        : (label ?? name),
    ]),
  );

  const tree = tagTree(tags, (a, b) =>
    compare(shownOf.get(a.id)!, shownOf.get(b.id)!),
  );

  const relations = tagRelations(tags, language);

  const tagOptions = tree.map(
    ({
      tag: { id, name, label, latin, count, total, synonyms },
      depth,
      key,
    }) => ({
      key,
      id,
      name,
      value: tagKey({ id, name }),
      shown: shownOf.get(id)!,
      depth,
      count,
      total,
      relation: relations.get(id),
      // What the search box finds it by; synonyms apart, to tell the hit.
      own: [label, name, latin].flatMap((s) => (s ? [tagNameKey(s)] : [])),
      // Slovak words: elsewhere a hit by one would show it untranslated.
      synonyms:
        language === 'sk'
          ? synonyms.map((s) => [s, tagNameKey(s)] as const)
          : [],
    }),
  );

  // A tag's first place in the tree, to mark it chosen in the list.
  const keyOfId = new Map<number, string>();

  for (const { id, key } of tagOptions) {
    if (!keyOfId.has(id)) {
      keyOfId.set(id, key);
    }
  }

  return {
    tagOptions,
    optionByKey: new Map(tagOptions.map((option) => [option.key, option])),
    keyOfId,
    suggestions: tagOptions.map(
      ({ key, shown, depth, count, total }): TagTreeSuggestion => ({
        value: key,
        label: shown,
        depth,
        count,
        total,
      }),
    ),
  };
}

// Per tag list and language: the upload modal has a form per photo.
const built = new WeakMap<
  GalleryTag[],
  Map<string, ReturnType<typeof buildTagSuggestions>>
>();

/**
 * The tags as ReactTags suggestions in their tree, a suggestion's value being
 * its path of ids ("/1/5/9"): a tag under two broader ones is two suggestions.
 */
export function useTagSuggestions(tags: GalleryTag[]) {
  const language = useAppSelector((state) => state.l10n.language);

  const result = useMemo(() => {
    let byLanguage = built.get(tags);

    if (!byLanguage) {
      byLanguage = new Map();

      built.set(tags, byLanguage);
    }

    let found = byLanguage.get(language);

    if (!found) {
      found = buildTagSuggestions(tags, language);

      byLanguage.set(language, found);
    }

    return found;
  }, [tags, language]);

  const { tagOptions, suggestions } = result;

  // The matches, each with the broader tags on its path. Always a new array:
  // ReactTags appends its own rows to it.
  const filterSuggestions = useCallback(
    (query: string): TagTreeSuggestion[] => {
      const q = tagNameKey(query);

      if (!q) {
        return [...suggestions];
      }

      const hits = new Map<string, string | undefined>();

      for (const option of tagOptions) {
        if (option.own.some((s) => s.includes(q))) {
          hits.set(option.key, undefined);
        } else {
          const synonym = option.synonyms.find(([, k]) => k.includes(q));

          if (synonym) {
            hits.set(option.key, synonym[0]);
          }
        }
      }

      // A key's prefixes are its ancestors.
      const kept = new Set(
        [...hits.keys()].flatMap((key) =>
          key
            .split('/')
            .slice(1)
            .map((_, i, ids) => `/${ids.slice(0, i + 1).join('/')}`),
        ),
      );

      return suggestions.flatMap((suggestion) =>
        kept.has(String(suggestion.value))
          ? [{ ...suggestion, synonym: hits.get(String(suggestion.value)) }]
          : [],
      );
    },
    [suggestions, tagOptions],
  );

  return { ...result, filterSuggestions };
}
