import { describe, expect, it } from 'vitest';
import { setSelectedColor, setSelectedIcon } from './actions.js';
import {
  objectsSettingsInitialState,
  objectsSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted objects marker-style slice. */
describe('objectsSettingsReducer', () => {
  it('setSelectedIcon stores the marker shape', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      setSelectedIcon('square'),
    );

    expect(next.selectedIcon).toBe('square');
  });

  it('setSelectedColor stores the marker color', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      setSelectedColor('#00ff00'),
    );

    expect(next.color).toBe('#00ff00');
  });
});
