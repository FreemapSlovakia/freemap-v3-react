import { describe, expect, it } from 'vitest';
import { orderByAppearance } from './useOpenOrder.js';

/** Runs the successive item lists through, as the renders would. */
function ids(...steps: string[][]): string[] {
  let order: string[] = [];

  let ordered: { id: string }[] = [];

  for (const step of steps) {
    ({ order, ordered } = orderByAppearance(
      order,
      step.map((id) => ({ id })),
    ));
  }

  return ordered.map((item) => item.id);
}

describe('orderByAppearance', () => {
  it('keeps the first order it is given', () => {
    expect(ids(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('appends what is new, wherever it arrives in the list', () => {
    expect(ids(['b'], ['a', 'b', 'c'])).toEqual(['b', 'a', 'c']);
  });

  it('leaves the order alone when nothing changes', () => {
    expect(ids(['b'], ['a', 'b'], ['a', 'b'])).toEqual(['b', 'a']);
  });

  it('closes a place without moving the rest', () => {
    expect(ids(['c', 'a', 'b'], ['a', 'b'], ['a', 'b', 'c'])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('is idempotent, so a re-render cannot reshuffle', () => {
    const items = [{ id: 'b' }, { id: 'a' }];

    const first = orderByAppearance(['a'], items);

    expect(orderByAppearance(first.order, items).order).toEqual(first.order);
  });
});
