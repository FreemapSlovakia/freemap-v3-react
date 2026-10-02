import {
  type FuzzyTarget,
  fuzzyMatch,
  prepareFuzzyTarget,
} from '@shared/fuzzyMatch.js';

/** A catalog entry's text, normalized once rather than on every keystroke. */
export type SearchTarget = { name: FuzzyTarget; extras: FuzzyTarget[] };

/** Per query character; looser matches score less, as in the search box. */
const minScorePerChar = 12;

/** A hit on a keyword, country or category ranks below one on the name. */
const extraPenalty = 20;

export function prepareSearchTarget(
  name: string,
  extras: readonly string[],
): SearchTarget {
  return {
    name: prepareFuzzyTarget(name),
    extras: extras.filter(Boolean).map(prepareFuzzyTarget),
  };
}

/**
 * The items matching `query`, best first and at most `limit` of them, with how
 * many matched in all. Each extra is matched on its own, so a query can't be
 * answered by characters gathered from across several.
 */
export function searchLibrary<T>(
  items: readonly T[],
  targets: readonly SearchTarget[],
  query: string,
  limit: number,
): { matches: T[]; total: number } {
  const trimmed = query.trim();

  if (!trimmed) {
    return { matches: [], total: 0 };
  }

  const floor = trimmed.replace(/\s/g, '').length * minScorePerChar;

  const scored: { item: T; score: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    const { name, extras } = targets[i];

    let score = fuzzyMatch(trimmed, name)?.score ?? Number.NEGATIVE_INFINITY;

    if (score < floor) {
      for (const extra of extras) {
        const hit = fuzzyMatch(trimmed, extra);

        if (hit) {
          score = Math.max(score, hit.score - extraPenalty);
        }
      }
    }

    if (score >= floor) {
      scored.push({ item: items[i], score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    matches: scored.slice(0, limit).map(({ item }) => item),
    total: scored.length,
  };
}
