import { describe, expect, it } from 'vitest';
import { objectsSetShowDetails, objectsSetStyle } from './actions.js';
import {
  objectsSettingsInitialState,
  objectsSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted objects settings slice. */
describe('objectsSettingsReducer', () => {
  it('objectsSetStyle stores the marker shape and color', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetStyle({ selectedIcon: 'square', color: '#00ff00' }),
    );

    expect(next.selectedIcon).toBe('square');
    expect(next.color).toBe('#00ff00');
  });

  it('shows the details of a selected feature by default', () => {
    expect(objectsSettingsInitialState.showDetails).toBe(true);
  });

  it('objectsSetShowDetails stores the details preference', () => {
    const next = objectsSettingsReducer(
      objectsSettingsInitialState,
      objectsSetShowDetails(false),
    );

    expect(next.showDetails).toBe(false);
    expect(next.selectedIcon).toBe(objectsSettingsInitialState.selectedIcon);
  });
});
