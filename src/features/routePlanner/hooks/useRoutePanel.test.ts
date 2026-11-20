import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import { routePanelShown } from './useRoutePanel.js';

const state = ({
  open = true,
  route = true,
  selection = null as { type: string } | null,
  inspected = null as number | null,
  mapTool = 'route-planner' as string | null,
} = {}) =>
  ({
    routePlannerSettings: { panelOpen: open },
    routePlanner: { alternatives: route ? [{}] : [] },
    main: { selection, mapTool },
    changesetInspector: { inspected },
  }) as unknown as RootState;

describe('routePanelShown', () => {
  it('shows an open panel while the route is worked with', () => {
    expect(routePanelShown(state())).toBe(true);

    for (const type of ['route-point', 'route-leg']) {
      expect(
        routePanelShown(state({ mapTool: null, selection: { type } })),
      ).toBe(true);
    }
  });

  it('hides it otherwise, the choice kept', () => {
    expect(routePanelShown(state({ open: false }))).toBe(false);
    expect(routePanelShown(state({ route: false }))).toBe(false);
    expect(routePanelShown(state({ mapTool: null }))).toBe(false);
    expect(
      routePanelShown(state({ mapTool: null, selection: { type: 'search' } })),
    ).toBe(false);
    expect(routePanelShown(state({ mapTool: 'draw-lines' }))).toBe(false);
    expect(routePanelShown(state({ inspected: 42 }))).toBe(false);
  });
});
