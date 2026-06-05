export function hasProperty<X, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return typeof obj === 'object' && obj && prop in obj;
}

/**
 * If `s` starts with `prefix`, returns the remainder (typed as the matching
 * suffix of `T`); otherwise returns `undefined`. Combines a prefix test with
 * extracting the rest of the string.
 */
export function afterPrefix<T extends string, const P extends string>(
  s: T,
  prefix: P,
): (T extends `${P}${infer S}` ? S : never) | undefined {
  return s.startsWith(prefix)
    ? (s.slice(prefix.length) as T extends `${P}${infer S}` ? S : never)
    : undefined;
}
