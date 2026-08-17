import type { Position } from 'geojson';
import {
  suggestSimplifyTolerance,
  TOLERANCE_UNIT,
} from './simplifyTolerance.js';

/**
 * The prompt's answer as a tolerance, or `null` when it is not one. A factor is
 * a non-negative number — `simplify` throws on anything else — and an empty
 * answer means none. The comma is read as a decimal point, which is what most
 * of the UI languages type.
 */
export function parseTolerance(answer: string): number | null {
  const value = Number(answer.trim().replace(',', '.'));

  return Number.isFinite(value) && value >= 0 ? value / TOLERANCE_UNIT : null;
}

/**
 * Asks how much to simplify what is about to become a drawing, filling the
 * question in with a factor derived from the geometry itself.
 *
 * Only geometry dense enough to be worth thinning is asked about — anything
 * shorter converts vertex for vertex, with no question at all. A `preamble` is
 * a warning that has to be seen (the track viewer's, that converting drops the
 * recorded per-point data), so it is asked even then.
 *
 * Returns the tolerance for the `convertToDrawing` payload, or `null` when the
 * question was cancelled — which cancels the conversion.
 */
export function promptSimplification(
  lines: Position[][],
  question: string | undefined,
  preamble?: string,
): number | null {
  const suggested = suggestSimplifyTolerance(lines);

  if (!suggested && !preamble) {
    return 0;
  }

  const text = preamble ? `${preamble}\n\n${question}` : question;

  // An answer that is not a factor is not a decision either, so ask again
  // rather than convert on a guess — or hand `simplify` something it throws on.
  for (;;) {
    const answer = window.prompt(text, String(suggested));

    if (answer === null) {
      return null;
    }

    const tolerance = parseTolerance(answer);

    if (tolerance !== null) {
      return tolerance;
    }
  }
}
