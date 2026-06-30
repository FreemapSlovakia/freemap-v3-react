import { describe, expect, it } from 'vitest';
import { objectsSetSelectedColor, objectsSetSelectedIcon } from './actions.js';
import {
  objectsSettingsInitialState,
  objectsSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted objects marker-style slice. */
describe('objectsSettingsReducer', () => {
  it('objectsSetSelectedIcon stores the marker shape', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetSelectedIcon('square'),
    );

    expect(next.selectedIcon).toBe('square');
  });

  it('objectsSetSelectedColor stores the marker color', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetSelectedColor('#00ff00'),
    );

    expect(next.color).toBe('#00ff00');
  });
});
