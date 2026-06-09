/**
 * Returns `value` narrowed to non-nullish, throwing if it is `null` or
 * `undefined`. Use it for invariants — a collection lookup whose element must
 * exist, a loop-bounded index — where a missing value signals a bug that should
 * surface loudly rather than be silently swallowed by an early return or hidden
 * by a bare `!`.
 */
export function assertDef<T>(
  value: T | null | undefined,
  message = 'unexpected nullish value',
): T {
  if (value == null) {
    throw new Error(message);
  }

  return value;
}
