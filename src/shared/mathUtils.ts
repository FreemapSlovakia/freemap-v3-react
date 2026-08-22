/**
 * Keeps `value` within the range, and answers `min` for a range the wrong way
 * round rather than the nonsense `Math.min(Math.max(…))` gives there — a
 * viewport briefly narrower than a panel's own minimum does exactly that.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Signed difference `a - b` folded into `[-180, 180)`, so the answer is the
 * short way round: easing a bearing towards another without it must take the
 * long way through the 359°→0° wrap.
 *
 * The second fold is what makes that true of any pair. One alone holds only
 * while the difference is under 540°, which is every bearing this has been
 * handed so far and no promise at all for the next caller.
 */
export function angleDiff(a: number, b: number): number {
  return mod(a - b + 180, 360) - 180;
}

/**
 * `value` modulo `n`, always non-negative — which `%` is not for a negative
 * left-hand side, and bearings go negative all the time.
 */
export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}
