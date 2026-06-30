import { describe, expect, it } from 'vitest';
import { objectsSetStyle } from './actions.js';
import {
  objectsSettingsInitialState,
  objectsSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted objects marker-style slice. */
describe('objectsSettingsReducer', () => {
  it('objectsSetStyle stores the marker shape and color', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetStyle({ selectedIcon: 'square', color: '#00ff00' }),
    );

    expect(next.selectedIcon).toBe('square');
    expect(next.color).toBe('#00ff00');
  });
});
