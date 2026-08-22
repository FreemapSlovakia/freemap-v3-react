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
 */
export function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}
