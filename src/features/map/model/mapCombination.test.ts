import type { Shading } from '@features/parameterizedShading/model/Shading.js';
import { describe, expect, it } from 'vitest';
import {
  activeCombinations,
  applyCombinationToLayers,
  combinationOpacity,
  type LayerKinds,
  type MapCombination,
  resolveCombination,
  withoutCombinations,
} from './mapCombination.js';

const known: LayerKinds = new Map([
  ['X', 'base'],
  ['O', 'base'],
  ['w', 'overlay'],
  ['I', 'overlay'],
  ['i', 'overlay'],
]);

const a: MapCombination = {
  id: 'a',
  name: 'A',
  base: 'X',
  overlays: [{ type: 'w', opacity: 0.3 }],
};

const b: MapCombination = {
  id: 'b',
  name: 'B',
  overlays: [{ type: 'w', opacity: 0.8 }, { type: 'I' }],
};

describe('activeCombinations', () => {
  it('lists the marked ones in the order they were activated', () => {
    expect(
      activeCombinations([a, b], ['X', 'w', '_b', 'I', '_a'], known).map(
        (c) => c.id,
      ),
    ).toEqual(['b', 'a']);
  });

  it('drops one whose base map is no longer on', () => {
    expect(activeCombinations([a], ['O', 'w', '_a'], known)).toEqual([]);
  });

  it('ignores a marker of an unknown combination', () => {
    expect(activeCombinations([a], ['X', '_zz'], known)).toEqual([]);
  });
});

describe('resolveCombination', () => {
  it('leaves the inverted `i` to the user', () => {
    expect(
      resolveCombination(
        { id: 'c', name: 'C', overlays: [{ type: 'i' }, { type: 'w' }] },
        known,
      )?.overlays,
    ).toEqual([{ type: 'w' }]);
  });

  it('drops a layer no longer of its kind', () => {
    expect(
      resolveCombination(
        { id: 'c', name: 'C', overlays: [{ type: 'w' }, { type: 'O' }] },
        known,
      )?.overlays,
    ).toEqual([{ type: 'w' }]);

    expect(
      resolveCombination(
        { id: 'c', name: 'C', base: 'w', overlays: [] },
        known,
      ),
    ).toBeUndefined();
  });
});

describe('withoutCombinations', () => {
  it('takes off the leaving one, matched by id, keeping what another holds', () => {
    const layers = ['X', 'w', '_b', 'I', '_a'];

    const active = activeCombinations([a, b], layers, known);

    // A copy, as a separately resolved combination is.
    expect(withoutCombinations(layers, [{ ...b }], active)).toEqual([
      'X',
      'w',
      '_a',
    ]);
  });
});

describe('applyCombinationToLayers', () => {
  const shading: Shading = { backgroundColor: [0, 0, 0, 0], components: [] };

  it('replaces the overlays with a base map one, keeping `i` and overlay-only ones', () => {
    expect(
      applyCombinationToLayers(['O', 'I', 'i', 'w', '_b'], a, [b]).layers,
    ).toEqual(['X', 'w', 'I', 'i', '_b', '_a']);
  });

  it('toggles an overlay-only one on and off', () => {
    const on = applyCombinationToLayers(['X'], b, [], { toggle: true });

    expect(on).toEqual({ layers: ['X', 'w', 'I', '_b'], off: false });

    expect(
      applyCombinationToLayers(on.layers, b, [b], { toggle: true }),
    ).toEqual({ layers: ['X'], off: true });
  });

  it('takes off another one carrying shading', () => {
    const s1 = { ...b, id: 's1', shading };

    const s2 = { id: 's2', name: 'S2', overlays: [{ type: 'I' }], shading };

    expect(
      applyCombinationToLayers(['X', 'w', 'I', '_s1'], s2, [s1]).layers,
    ).toEqual(['X', 'I', '_s2']);
  });

  it('first takes off the version it replaces', () => {
    const edited = { ...b, overlays: [{ type: 'w' }] };

    expect(
      applyCombinationToLayers(['X', 'w', 'I', '_b'], edited, [edited], {
        replaces: b,
      }).layers,
    ).toEqual(['X', 'w', '_b']);
  });
});

describe('combinationOpacity', () => {
  it('takes the last activated combination that sets one', () => {
    expect(combinationOpacity([a, b], 'w')).toBe(0.8);
    expect(combinationOpacity([b, a], 'w')).toBe(0.3);
    expect(combinationOpacity([a, b], 'I')).toBeUndefined();
  });
});
