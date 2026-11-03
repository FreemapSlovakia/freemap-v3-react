import {
  type FuzzyTarget,
  isWordStart,
  prepareFuzzyTarget,
} from '@shared/fuzzyMatch.js';

/** A chapter's text up to its next `##`; section 0 is what precedes the first. */
export type ManualSection = {
  key: string;
  section: number;
  heading: string | undefined;
  text: string;
  target: FuzzyTarget;
  headingTarget: FuzzyTarget | undefined;
};

export type ManualHit = {
  key: string;
  section: number;
  heading: string | undefined;
  /** An excerpt of the section around the first word found. */
  snippet: string;
  /** `[start, end)` ranges of `snippet` holding a query word. */
  marks: [number, number][];
  score: number;
};

const SNIPPET_BEFORE = 40;

const SNIPPET_LENGTH = 140;

const MAX_HITS = 50;

/** Splits a chapter's rendered HTML into its sections, as plain text. */
export function sectionsOf(key: string, html: string): ManualSection[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const sections: ManualSection[] = [];

  let heading: string | undefined;

  // Counts the `h2`s, so a chapter opening with one has no section 0.
  let section = 0;

  let parts: string[] = [];

  const flush = () => {
    const text = parts.join(' ').replace(/\s+/g, ' ').trim();

    if (text || heading) {
      sections.push({
        key,
        section,
        heading,
        text,
        target: prepareFuzzyTarget(text),
        headingTarget: heading ? prepareFuzzyTarget(heading) : undefined,
      });
    }
  };

  for (const el of Array.from(doc.body.children)) {
    if (el.tagName === 'H2') {
      flush();

      section++;

      heading = el.textContent?.trim() ?? '';

      parts = [];
    } else {
      parts.push(el.textContent ?? '');
    }
  }

  flush();

  return sections;
}

/** Each occurrence of `word` in `text`, by its start. */
function occurrences(text: string, word: string): number[] {
  const at: number[] = [];

  for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) {
    at.push(i);
  }

  return at;
}

/**
 * The sections holding every word of `query`, ignoring case and accents, best
 * first: words in the heading, then words found at a word start, count most.
 */
export function searchSections(
  query: string,
  sections: readonly ManualSection[],
): ManualHit[] {
  const words = [
    ...new Set(
      prepareFuzzyTarget(query)
        .text.split(/\s+/)
        .filter((word) => word.length >= 2),
    ),
  ];

  if (words.length === 0) {
    return [];
  }

  const hits: ManualHit[] = [];

  for (const s of sections) {
    let score = 0;

    const found: number[][] = [];

    for (const word of words) {
      const inHeading = s.headingTarget
        ? occurrences(s.headingTarget.text, word).length
        : 0;

      const inText = occurrences(s.target.text, word);

      if (inHeading + inText.length === 0) {
        break;
      }

      found.push(inText);

      score +=
        inHeading * 10 +
        inText.reduce(
          (sum, i) => sum + (isWordStart(s.target.text, i) ? 3 : 1),
          0,
        );
    }

    if (found.length < words.length) {
      continue;
    }

    hits.push({ ...excerpt(s, words, found), score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, MAX_HITS);
}

function excerpt(
  s: ManualSection,
  words: string[],
  found: number[][],
): Omit<ManualHit, 'score'> {
  const { text, origin } = s.target;

  // Normalized offsets back to the original text, whose length may differ.
  const orig = (i: number) => (i < origin.length ? origin[i] : s.text.length);

  // The words may all be in the heading, leaving the text to start from 0.
  const all = found.flat();

  const anchor = all.length ? orig(Math.min(...all)) : 0;

  const start =
    anchor > SNIPPET_BEFORE
      ? s.text.lastIndexOf(' ', anchor - SNIPPET_BEFORE) + 1
      : 0;

  let end = Math.min(s.text.length, start + SNIPPET_LENGTH);

  if (end < s.text.length) {
    end = Math.max(s.text.lastIndexOf(' ', end), anchor + 1);
  }

  const lead = start > 0 ? '… ' : '';

  const snippet =
    lead + s.text.slice(start, end) + (end < s.text.length ? ' …' : '');

  const marks: [number, number][] = [];

  words.forEach((word, wi) => {
    for (const i of found[wi]) {
      const a = orig(i);

      const b = orig(Math.min(i + word.length, text.length) - 1) + 1;

      if (a >= start && b <= end) {
        marks.push([a - start + lead.length, b - start + lead.length]);
      }
    }
  });

  // One word can sit inside another's hit (`ma` in `mapa`).
  const merged: [number, number][] = [];

  for (const mark of marks.toSorted((x, y) => x[0] - y[0])) {
    const last = merged.at(-1);

    if (last && mark[0] <= last[1]) {
      last[1] = Math.max(last[1], mark[1]);
    } else {
      merged.push([...mark]);
    }
  }

  return {
    key: s.key,
    section: s.section,
    heading: s.heading,
    snippet,
    marks: merged,
  };
}
