import { type FuzzyMatch, fuzzyMatch } from './fuzzyMatch.js';

/** Below this a query matches no label; the search box leaves it to the geocoder. */
const minQueryLength = 2;

/**
 * Longer than any label or synonym, so past it nothing can match — and matching
 * costs the query's length against every candidate, which a pasted paragraph
 * would spend on each keystroke.
 */
const maxQueryLength = 64;

/** Per query character; loose matches score less than this. */
const minScorePerChar = 12;

/** A synonym hit is a weaker one than the label saying the same. */
const keywordPenalty = 20;

/**
 * How well `query` finds a row by its label or one of its comma-separated
 * synonyms, as the search box ranks its functions; null for no match.
 * `positions` index into the label, and are empty for a synonym-only hit.
 */
export function matchLabel(
  query: string,
  label: string,
  keywords: string | undefined,
): FuzzyMatch | null {
  const trimmed = query.trim();

  if (trimmed.length < minQueryLength || trimmed.length > maxQueryLength) {
    return null;
  }

  const hit = fuzzyMatch(trimmed, label);

  let score = hit?.score ?? Number.NEGATIVE_INFINITY;

  // Each synonym is matched on its own, so a query can't be answered by
  // characters gathered from across the whole list.
  for (const keyword of keywords?.split(',') ?? []) {
    const kw = fuzzyMatch(trimmed, keyword.trim());

    if (kw) {
      score = Math.max(score, kw.score - keywordPenalty);
    }
  }

  return score >= trimmed.replace(/\s/g, '').length * minScorePerChar
    ? { score, positions: hit?.positions ?? [] }
    : null;
}
