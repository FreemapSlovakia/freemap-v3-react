import { describe, expect, it } from 'vitest';
import { overlayStack } from './overlayStack.js';

const items = [
  { type: 'shading', zIndex: 2 },
  { type: 'trails', zIndex: 5 },
  { type: 'cadastre', zIndex: 3 },
  { type: 'photos', zIndex: 8, pinned: true },
  { type: 'custom' },
];

describe('overlayStack', () => {
  it('orders by default z-index, pinned ones on top', () => {
    expect(overlayStack(items, [])).toEqual([
      'photos',
      'trails',
      'cadastre',
      'shading',
      'custom',
    ]);
  });

  it('keeps the user’s order and slots in the rest by z-index', () => {
    // `trails` isn't in the order: above the first one it outranks.
    expect(overlayStack(items, ['cadastre', 'custom', 'shading'])).toEqual([
      'photos',
      'trails',
      'cadastre',
      'custom',
      'shading',
    ]);

    expect(overlayStack(items, ['shading', 'cadastre', 'custom'])).toEqual([
      'photos',
      'trails',
      'shading',
      'cadastre',
      'custom',
    ]);
  });

  it('puts the later of equal z-indexes above', () => {
    expect(
      overlayStack(
        [{ type: 'builtIn' }, { type: 'custom' }, { type: 'offline' }],
        [],
      ),
    ).toEqual(['offline', 'custom', 'builtIn']);
  });

  it('keeps equal z-indexes in place whichever of them is in the order', () => {
    const equal = [{ type: 'a' }, { type: 'b' }, { type: 'c' }];

    expect(overlayStack(equal, ['b'])).toEqual(['c', 'b', 'a']);

    expect(overlayStack(equal, ['a'])).toEqual(['c', 'b', 'a']);
  });

  it('ignores unknown and pinned types in the order', () => {
    expect(
      overlayStack(items, ['gone', 'photos', 'shading', 'trails', 'cadastre']),
    ).toEqual(['photos', 'shading', 'trails', 'cadastre', 'custom']);
  });
});
