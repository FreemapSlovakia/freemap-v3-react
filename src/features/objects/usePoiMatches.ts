import {
  type FuzzyTarget,
  fuzzyMatch,
  prepareFuzzyTarget,
} from '@shared/fuzzyMatch.js';
import { useMemo } from 'react';
import type { ObjectCategory } from './objectCategories.js';
import { useObjectCategories } from './useObjectCategories.js';

export type PoiMatch = {
  category: ObjectCategory;
  /** Indexes into the category's name of the characters the query matched. */
  positions: number[];
  score: number;
};

/** Below this the query is left to the geocoder alone. */
const minQueryLength = 2;

/**
 * Longer than any category name, so past it nothing can match — and matching
 * costs the query's length against ~1800 candidates on every keystroke.
 */
const maxQueryLength = 64;

/** Few enough that the places the box is for are still on the screen. */
const maxMatches = 5;

/** Per query character; loose matches score less than this. */
const minScorePerChar = 12;

/** Finding a category by its raw tags is a weaker hit than by its name. */
const tagPenalty = 20;

/**
 * The POI categories a query names, best first — the same fuzzy match the
 * app's own functions are found by. Empty until the tag-to-name mapping lands,
 * and while the query is too short to be worth asking.
 */
export function usePoiMatches(query: string): PoiMatch[] {
  const trimmed = query.trim();

  const worthAsking =
    trimmed.length >= minQueryLength && trimmed.length <= maxQueryLength;

  const categories = useObjectCategories(worthAsking);

  // Normalizing a target is the bulk of a match, and there are ~1800 of them
  // against every keystroke — so it is done once per category list instead.
  const targets = useMemo(
    () =>
      categories.map((category): [FuzzyTarget, FuzzyTarget] => [
        prepareFuzzyTarget(category.name),
        prepareFuzzyTarget(category.key),
      ]),
    [categories],
  );

  return useMemo(() => {
    if (!worthAsking) {
      return [];
    }

    const floor = trimmed.replace(/\s/g, '').length * minScorePerChar;

    const matches: PoiMatch[] = [];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      if (!category.name) {
        continue;
      }

      const [nameTarget, keyTarget] = targets[i];

      const hit = fuzzyMatch(trimmed, nameTarget);

      let score = hit?.score ?? Number.NEGATIVE_INFINITY;

      // `amenity=pub` finds the pub category too, which is how a mapper looks.
      // Only where the name didn't already answer: the tag can score no higher.
      if (score < floor) {
        const tagHit = fuzzyMatch(trimmed, keyTarget);

        if (tagHit) {
          score = Math.max(score, tagHit.score - tagPenalty);
        }
      }

      if (score >= floor) {
        matches.push({ category, score, positions: hit?.positions ?? [] });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, maxMatches);
  }, [trimmed, worthAsking, categories, targets]);
}
