import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
} from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { describe, expect, it } from 'vitest';
import { cancelType, measurementStale } from './measurementProcessor.js';

/**
 * The dismissal rules for the line/area measurement readout. `measurementStale`
 * decides when the readout is no longer relevant; `cancelType` lists the
 * actions that also dismiss it. Both only read `main.tools` / `main.selection`,
 * so a minimal cast state is enough.
 */

const state = (tools: string[], selectionType?: string): RootState =>
  ({
    main: {
      tools,
      selection: selectionType ? { type: selectionType } : undefined,
    },
  }) as unknown as RootState;

describe('measurementStale', () => {
  it('keeps the readout while a draw tool is open, whatever the selection', () => {
    expect(measurementStale(state(['draw-lines']))).toBe(false);
    expect(measurementStale(state(['draw-points'], 'search'))).toBe(false);
  });

  it('keeps the readout in selecting mode while a line is selected', () => {
    // No draw tool open (e.g. after converting a route to a drawing), yet a
    // selected line or vertex stays measured.
    expect(measurementStale(state([], 'draw-line-poly'))).toBe(false);
    expect(measurementStale(state([], 'line-point'))).toBe(false);
  });

  it('dismisses the readout with no draw tool and no line selected', () => {
    expect(measurementStale(state([]))).toBe(true);
    expect(measurementStale(state([], 'search'))).toBe(true);
    expect(measurementStale(state([], 'draw-points'))).toBe(true);
    expect(measurementStale(state(['objects']))).toBe(true);
  });
});

describe('measurement readout cancelType', () => {
  it('dismisses on a selection change, clear, or delete', () => {
    expect(cancelType).toContain(selectFeature.type);
    expect(cancelType).toContain(clearMapFeatures.type);
    expect(cancelType).toContain(deleteFeature.type);
  });

  it('does not dismiss on map pan/zoom', () => {
    // A measurement pins a fixed geometry, so moving the map must not clear it.
    expect(cancelType).not.toContain(mapRefocus.type);
  });
});
