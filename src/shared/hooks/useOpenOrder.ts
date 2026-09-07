import { useRef } from 'react';

/**
 * Sorts `items` by when each id first showed up, appending the ones that are
 * new — so a panel that opens joins the end instead of reordering the ones
 * already on the screen. An id that goes and comes back counts as new.
 *
 * `previous` is the order the last call arrived at; `order` is the one to hand
 * back next time.
 */
export function orderByAppearance<T extends { id: string }>(
  previous: string[],
  items: T[],
): { order: string[]; ordered: T[] } {
  const ids = items.map((item) => item.id);

  const kept = previous.filter((id) => ids.includes(id));

  const order = [...kept, ...ids.filter((id) => !kept.includes(id))];

  return {
    order,
    ordered: [...items].sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    ),
  };
}

/** {@link orderByAppearance} across renders. */
export function useOpenOrder<T extends { id: string }>(items: T[]): T[] {
  const orderRef = useRef<string[]>([]);

  const { order, ordered } = orderByAppearance(orderRef.current, items);

  // Written during render, not in an effect: an item must be in its place in
  // the commit it appears in, or the strip visibly reshuffles for a frame. The
  // call is idempotent, so a re-run with the same ids changes nothing.
  orderRef.current = order;

  return ordered;
}
