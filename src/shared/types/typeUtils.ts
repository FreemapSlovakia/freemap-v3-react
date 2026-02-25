export function hasProperty<X, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return typeof obj === 'object' && obj && prop in obj;
}
