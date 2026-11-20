import { closeTool, openTool, selectFeature } from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import {
  routePlannerColorizeBy,
  routePlannerPreventHint,
  routePlannerSetColorizeLegend,
  routePlannerSetPanelOpen,
} from './actions.js';
import {
  routePlannerSettingsInitialState,
  routePlannerSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted route-planner settings slice. */

describe('routePlannerSettingsReducer', () => {
  it('colorizeBy stores the mode', () => {
    const next = routePlannerSettingsReducer(
      routePlannerSettingsInitialState,
      routePlannerColorizeBy('elevation'),
    );

    expect(next.colorizeBy).toBe('elevation');
  });

  it('setColorizeLegend flips with no payload, honors an explicit value', () => {
    const flipped = routePlannerSettingsReducer(
      routePlannerSettingsInitialState,
      routePlannerSetColorizeLegend(undefined),
    );
    expect(flipped.colorizeLegend).toBe(
      !routePlannerSettingsInitialState.colorizeLegend,
    );

    const explicit = routePlannerSettingsReducer(
      routePlannerSettingsInitialState,
      routePlannerSetColorizeLegend(false),
    );
    expect(explicit.colorizeLegend).toBe(false);
  });

  it('preventHint sets the flag', () => {
    const next = routePlannerSettingsReducer(
      routePlannerSettingsInitialState,
      routePlannerPreventHint(),
    );

    expect(next.preventHint).toBe(true);
  });
});

describe('routePlannerSettingsReducer — route panel', () => {
  const open = routePlannerSettingsReducer(
    routePlannerSettingsInitialState,
    routePlannerSetPanelOpen(true),
  );

  it('stays open whatever else is opened or closed', () => {
    expect(
      [
        selectFeature({ type: 'route-point', id: 0 }),
        openTool('draw-lines'),
        closeTool('route-planner'),
      ].reduce(routePlannerSettingsReducer, open).panelOpen,
    ).toBe(true);
  });
});
