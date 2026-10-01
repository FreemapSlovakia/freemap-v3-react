import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import { mapLibraryInitialState } from './reducer.js';
import {
  integratedLayerDefMapSelector,
  integratedLayerDefsSelector,
} from './selectors.js';

const stateWith = (
  layers: string[],
  layersSettings: Record<string, { installed?: boolean }>,
) =>
  ({
    map: { layers, layersSettings },
    mapLibrary: mapLibraryInitialState,
  }) as unknown as RootState;

describe('integratedLayerDefsSelector', () => {
  it('has the bundled maps from the start', () => {
    const types = integratedLayerDefsSelector(stateWith([], {})).map(
      (def) => def.type,
    );

    expect(types).toEqual(expect.arrayContaining(['X', 'S', 'O', 'h']));

    expect(types).not.toContain('WKA');
  });

  it('lists an uninstalled map only while it is on', () => {
    const settings = { O: { installed: false } };

    const types = (layers: string[]) =>
      integratedLayerDefsSelector(stateWith(layers, settings)).map(
        (def) => def.type,
      );

    expect(types(['X'])).not.toContain('O');

    expect(types(['O'])).toContain('O');
  });

  it('still looks an uninstalled map up by id', () => {
    expect(
      integratedLayerDefMapSelector(stateWith([], { O: { installed: false } }))[
        'O'
      ],
    ).toMatchObject({ technology: 'tile' });
  });
});
