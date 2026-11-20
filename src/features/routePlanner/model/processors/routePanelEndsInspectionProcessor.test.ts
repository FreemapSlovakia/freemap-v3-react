import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import { routePlannerSetPanelOpen } from '../actions.js';
import { routePanelEndsInspectionProcessor } from './routePanelEndsInspectionProcessor.js';

const state = (
  panelOpen: boolean,
  selection: { type: string } | null,
  inspected: number | null = null,
) =>
  ({
    routePlanner: { alternatives: [{}] },
    routePlannerSettings: { panelOpen },
    main: { selection },
    changesetInspector: { inspected },
  }) as unknown as RootState;

describe('routePanelEndsInspectionProcessor', () => {
  const { actionPredicate, statePredicate } = routePanelEndsInspectionProcessor;

  it('ends an inspection when the panel opens', () => {
    expect(actionPredicate?.(routePlannerSetPanelOpen(true))).toBe(true);
    expect(actionPredicate?.(routePlannerSetPanelOpen(false))).toBe(false);
    expect(statePredicate?.(state(false, null, 42))).toBe(true);
    expect(statePredicate?.(state(false, null))).toBe(false);
  });
});
