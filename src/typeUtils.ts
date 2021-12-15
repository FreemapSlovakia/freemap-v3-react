export function hasProperty<X, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return typeof obj === 'object' && Boolean(obj) && prop in obj;
}
