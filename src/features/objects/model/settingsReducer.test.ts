import { describe, expect, it } from 'vitest';
import {
  objectsSetSelectedColor,
  objectsSetSelectedIcon,
  objectsSetSettings,
} from './actions.js';
import {
  objectsSettingsInitialState,
  objectsSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted objects marker-style slice. */
describe('objectsSettingsReducer', () => {
  it('setSelectedIcon stores the marker shape', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetSelectedIcon('square'),
    );

    expect(next.selectedIcon).toBe('square');
  });

  it('setSelectedColor stores the marker color', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetSelectedColor('#00ff00'),
    );

    expect(next.color).toBe('#00ff00');
  });

  it('objectsSetSettings stores the marker shape and color together', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetSettings({ selectedIcon: 'ring', color: '#0000ff' }),
    );

    expect(next.selectedIcon).toBe('ring');
    expect(next.color).toBe('#0000ff');
  });
});
