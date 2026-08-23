import { angleDiff, mod } from '@shared/mathUtils.js';
import type { PanoramaLabel } from './types.js';

/** How many buckets either side of its own a label has to be compared against. */
const NEIGHBOUR_BUCKETS = 2;

/**
 * Thins a crowd down to one name per `minPitchDeg` of horizon, keeping whichever
 * ranks highest — so the labels take the picture in rank order. Takes them
 * **already ranked** (`rankLabels`), since nothing in the type carries it.
 *
 * In degrees rather than pixels, and over every candidate rather than the ones
 * on screen: what is named must not depend on where the view points, or a
 * summit scrolling in at one edge takes the name off a summit in the middle.
 *
 * Each candidate is compared only against what was kept near it, because the
 * flat scan degenerates exactly where it runs hottest: magnified far enough,
 * the pitch is finer than the gaps, so nothing is thinned, nothing
 * short-circuits, and every one of the better part of a thousand compares
 * against all the rest — on every frame of a pinch.
 */
export function thinLabels(
  labels: PanoramaLabel[],
  minPitchDeg: number,
): PanoramaLabel[] {
  // The busiest density asks for no pitch at all, and keeps everything.
  if (minPitchDeg <= 0) {
    return labels;
  }

  // Uniform and no wider than the pitch, so whatever lies within one pitch is
  // at most `NEIGHBOUR_BUCKETS` away — the ceiling never gives a bucket
  // narrower than half of it.
  const count = Math.ceil(360 / minPitchDeg);

  const width = 360 / count;

  const kept: PanoramaLabel[] = [];

  const byBucket = new Map<number, PanoramaLabel[]>();

  for (const label of labels) {
    const home = Math.floor(mod(label.azimuth, 360) / width) % count;

    let clear = true;

    for (let d = -NEIGHBOUR_BUCKETS; clear && d <= NEIGHBOUR_BUCKETS; d++) {
      clear = !byBucket
        .get(mod(home + d, count))
        ?.some(
          (k) => Math.abs(angleDiff(label.azimuth, k.azimuth)) < minPitchDeg,
        );
    }

    if (clear) {
      kept.push(label);

      const bucket = byBucket.get(home);

      if (bucket) {
        bucket.push(label);
      } else {
        byBucket.set(home, [label]);
      }
    }
  }

  return kept;
}

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
 * order, so what gets dropped in a crowd is whatever stands out least.
 *
 * How many names the picture holds is {@link thinLabels}'s to decide, not this
 * one's: the crowd is thinned before the view is ever consulted.
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
  }: LayoutOptions,
): LabelPlacement[] {
  const gutter = 6;

  const placed: LabelPlacement[] = [];

  for (const label of labels) {
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
