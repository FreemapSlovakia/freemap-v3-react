/**
 * Command-palette fuzzy matching: the query's characters must appear in the
 * target in order, each one either starting a word or continuing the character
 * before it — so `rofi` finds `Route finder` while `panora` does not smear
 * itself across `plánovač trás`. A query held whole inside a word matches too.
 * Case and accents are ignored, so `tienovanie` finds `Tieňovanie`.
 */

const MATCH = 16;

const CONSECUTIVE_BONUS = 8;

const WORD_START_BONUS = 10;

const START_BONUS = 6;

/** Per target character passed over, so an early match beats a late one. */
const SKIP_PENALTY = 1;

export type FuzzyMatch = {
  /** Comparable only between matches of the same query. */
  score: number;
  /** Indexes into the target of the characters the query matched, ascending. */
  positions: number[];
};

const WORD_CHAR = /[\p{L}\p{N}]/u;

const COMBINING = /[̀-ͯ]/g;

/**
 * Lower-cases and strips accents one character at a time, so every character of
 * the result still names the one it came from — which is what lets a match be
 * highlighted in the original string.
 */
function normalize(value: string): { text: string; origin: number[] } {
  let text = '';

  const origin: number[] = [];

  for (let i = 0; i < value.length; i++) {
    const stripped = value[i]
      .toLowerCase()
      .normalize('NFD')
      .replace(COMBINING, '');

    for (const ch of stripped) {
      text += ch;

      origin.push(i);
    }
  }

  return { text, origin };
}

/**
 * Scores `query` against `target`, or answers `null` when the query's
 * characters don't all appear in order. An empty query matches nothing.
 */
export function fuzzyMatch(query: string, target: string): FuzzyMatch | null {
  const q = normalize(query).text.replace(/\s+/g, ' ').trim();

  if (!q) {
    return null;
  }

  const { text: t, origin } = normalize(target);

  const ql = q.length;

  const tl = t.length;

  // Most candidates don't hold the query's characters at all, and the scoring
  // below is quadratic, so they are turned away by a greedy pass first.
  for (let qi = 0, ti = 0; qi < ql; ti++) {
    if (ti === tl) {
      return null;
    }

    if (q[qi] === t[ti]) {
      qi++;
    }
  }

  // Best score for the rest of the query, per (query index, target index,
  // whether the previous target character was matched) — the last of which
  // decides whether a hit here is a consecutive one.
  const memo = new Float64Array(2 * (ql + 1) * (tl + 1)).fill(Number.NaN);

  const slot = (qi: number, ti: number, prev: boolean) =>
    (prev ? (ql + 1) * (tl + 1) : 0) + qi * (tl + 1) + ti;

  const isWordStart = (ti: number) => ti === 0 || !WORD_CHAR.test(t[ti - 1]);

  function best(qi: number, ti: number, prev: boolean): number {
    if (qi === ql) {
      return 0;
    }

    if (tl - ti < ql - qi) {
      return Number.NEGATIVE_INFINITY;
    }

    const key = slot(qi, ti, prev);

    const cached = memo[key];

    if (!Number.isNaN(cached)) {
      return cached;
    }

    let score = best(qi, ti + 1, false) - SKIP_PENALTY;

    if (q[qi] === t[ti] && (prev || isWordStart(ti))) {
      const bonus =
        MATCH +
        (prev ? CONSECUTIVE_BONUS : 0) +
        (isWordStart(ti) ? WORD_START_BONUS : 0) +
        (ti === 0 ? START_BONUS : 0);

      score = Math.max(score, bonus + best(qi + 1, ti + 1, true));
    }

    memo[key] = score;

    return score;
  }

  const score = best(0, 0, false);

  if (score === Number.NEGATIVE_INFINITY) {
    // Nothing starts a word, but a compound may still hold the query whole —
    // `radar` in `Meteoradar`. Contiguous, so it can't be the smear the rule
    // above exists to refuse.
    const at = t.indexOf(q);

    return at === -1
      ? null
      : {
          score: ql * MATCH + (ql - 1) * CONSECUTIVE_BONUS - at,
          positions: Array.from({ length: ql }, (_, i) => origin[at + i]),
        };
  }

  // Walks the decisions the score was made of, keeping every character taking
  // which is what it is worth.
  const positions: number[] = [];

  let qi = 0;

  let ti = 0;

  let prev = false;

  while (qi < ql) {
    if (best(qi, ti, prev) === best(qi, ti + 1, false) - SKIP_PENALTY) {
      ti++;

      prev = false;
    } else {
      positions.push(origin[ti]);

      qi++;

      ti++;

      prev = true;
    }
  }

  return { score, positions };
}
