import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import { routePanelShown } from './useRoutePanel.js';

const state = ({
  open = true,
  route = true,
  selection = null as { type: string } | null,
  inspected = null as number | null,
  mapTool = null as string | null,
} = {}) =>
  ({
    routePlannerSettings: { panelOpen: open },
    routePlanner: { alternatives: route ? [{}] : [] },
    main: { selection, mapTool },
    changesetInspector: { inspected },
  }) as unknown as RootState;

describe('routePanelShown', () => {
  it('shows an open panel with a route, beside the route planner or no tool', () => {
    expect(routePanelShown(state())).toBe(true);
    expect(routePanelShown(state({ mapTool: 'route-planner' }))).toBe(true);
    expect(routePanelShown(state({ selection: { type: 'route-point' } }))).toBe(
      true,
    );
  });

  it('hides it with no route, or while another panel or tool holds the map', () => {
    expect(routePanelShown(state({ open: false }))).toBe(false);
    expect(routePanelShown(state({ route: false }))).toBe(false);
    expect(routePanelShown(state({ selection: { type: 'search' } }))).toBe(
      false,
    );
    expect(routePanelShown(state({ inspected: 42 }))).toBe(false);
    expect(routePanelShown(state({ mapTool: 'draw-lines' }))).toBe(false);
  });
});
