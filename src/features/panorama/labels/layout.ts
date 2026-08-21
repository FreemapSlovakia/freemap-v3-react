import type { PanoramaLabel } from './types.js';

/** Where a label's subject sits on screen, in viewport pixels. */
export interface LabelAnchor {
  x: number;
  y: number;
}

export interface LabelPlacement {
  label: PanoramaLabel;
  /** The text box, in viewport pixels. */
  left: number;
  top: number;
  width: number;
  /** The end of the leader line: the subject itself. */
  anchor: LabelAnchor;
}

export interface LayoutOptions {
  /** Where a label's subject is on screen, or null when it isn't. */
  anchor: (label: PanoramaLabel) => LabelAnchor | null;
  /** Rendered width of the label's text. */
  measure: (label: PanoramaLabel) => number;
  viewportWidth: number;
  /** One line of text, which is also how far a crowded label climbs. */
  lineHeight: number;
  /** Shortest leader drawn, so no text sits on the thing it names. */
  minLeader: number;
  /** How far a label may climb before it is given up on. */
  maxClimb: number;
  /** Highest a label may sit — room kept for the compass strip. */
  minTop?: number;
  /** Stops after this many are placed. */
  limit?: number;
}

function overlaps(
  a: { left: number; top: number; width: number },
  b: { left: number; top: number; width: number },
  lineHeight: number,
  gutter: number,
): boolean {
  return (
    a.left < b.left + b.width + gutter &&
    b.left < a.left + a.width + gutter &&
    a.top < b.top + lineHeight &&
    b.top < a.top + lineHeight
  );
}

/**
 * Places as many labels as the view has room for, taking them **already in
 * rank order** — the caller ranks once per render, since this runs on every
 * frame of a pan and a rich view carries the better part of a thousand.
 *
 * Each one wants to sit centred just above its subject; where that spot is
 * taken it climbs by a line at a time until it finds air, and is dropped if it
 * reaches the top of the view without finding any. Labels are taken in rank
 * order, so what gets dropped in a crowd is whatever stands out least — and
 * because it all runs against screen positions, zooming in reveals more labels
 * without asking the server for anything.
 *
 * A summit too near the top of the frame to have a line above it goes unnamed
 * rather than being written over itself; widening the vertical view or turning
 * to look at it lower brings the name back.
 */
export function layoutLabels(
  labels: PanoramaLabel[],
  {
    anchor,
    measure,
    viewportWidth,
    lineHeight,
    minLeader,
    maxClimb,
    minTop = 0,
    limit,
  }: LayoutOptions,
): LabelPlacement[] {
  const gutter = 6;

  const placed: LabelPlacement[] = [];

  for (const label of labels) {
    if (limit !== undefined && placed.length >= limit) {
      break;
    }

    const at = anchor(label);

    if (!at) {
      continue;
    }

    const width = measure(label);

    const left = at.x - width / 2;

    if (left + width < 0 || left > viewportWidth) {
      continue;
    }

    const bottom = at.y - minLeader;

    let top = bottom - lineHeight;

    while (
      top >= minTop &&
      bottom - (top + lineHeight) <= maxClimb &&
      placed.some((p) => overlaps({ left, top, width }, p, lineHeight, gutter))
    ) {
      top -= lineHeight;
    }

    if (top < minTop || bottom - (top + lineHeight) > maxClimb) {
      continue;
    }

    placed.push({ label, left, top, width, anchor: at });
  }

  return placed;
}
