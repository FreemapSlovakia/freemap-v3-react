import { hasPanel } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useDispatch, useStore } from 'react-redux';
import {
  type RoutePanelView,
  routePlannerSetPanelOpen,
  routePlannerSetPanelView,
} from '../model/actions.js';

/**
 * The route panel is shown: open, with a route to show, while no other panel
 * holds the dock and no other tool the map's clicks.
 */
export function routePanelShown(state: RootState): boolean {
  const { mapTool } = state.main;

  return (
    state.routePlannerSettings.panelOpen &&
    state.routePlanner.alternatives.length > 0 &&
    !hasPanel(state.main.selection?.type) &&
    state.changesetInspector.inspected === null &&
    (!mapTool || mapTool === 'route-planner')
  );
}

/** The view the route panel shows: the weather where there is no itinerary. */
export function routePanelView(state: RootState): RoutePanelView {
  return state.routePlanner.mode === 'route'
    ? state.routePlannerSettings.panelView
    : 'weather';
}

/** Counts a view of the route panel being shown. */
export function trackRoutePanelView(view: RoutePanelView): void {
  trackMatomo(
    view === 'itinerary'
      ? ['trackEvent', 'RoutePlanner', 'itinerary']
      : ['trackEvent', 'Weather', 'route'],
  );
}

/** Opens the route panel, on `view` if given. */
export function useOpenRoutePanel(): (view?: RoutePanelView) => void {
  const dispatch = useDispatch();

  const store = useStore<RootState>();

  return (view) => {
    const state = store.getState();

    const shown = view ?? routePanelView(state);

    // A view switched to on an open panel counts as the toggle's does.
    if (!routePanelShown(state) || shown !== routePanelView(state)) {
      trackRoutePanelView(shown);
    }

    if (view) {
      dispatch(routePlannerSetPanelView(view));
    }

    dispatch(routePlannerSetPanelOpen(true));
  };
}
