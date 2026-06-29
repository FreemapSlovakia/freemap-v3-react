import { describe, expect, it } from 'vitest';
import { trackingActions } from './actions.js';
import {
  trackingSettingsInitialState,
  trackingSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted tracking settings slice. */

describe('trackingSettingsReducer', () => {
  it('setColorizeBy stores the mode', () => {
    const next = trackingSettingsReducer(
      trackingSettingsInitialState,
      trackingActions.setColorizeBy('speed'),
    );

    expect(next.colorizeBy).toBe('speed');
  });

  it('setColorizeLegend flips with no payload, honors an explicit value', () => {
    const flipped = trackingSettingsReducer(
      trackingSettingsInitialState,
      trackingActions.setColorizeLegend(undefined),
    );
    expect(flipped.colorizeLegend).toBe(
      !trackingSettingsInitialState.colorizeLegend,
    );

    const explicit = trackingSettingsReducer(
      trackingSettingsInitialState,
      trackingActions.setColorizeLegend(false),
    );
    expect(explicit.colorizeLegend).toBe(false);
  });
});
