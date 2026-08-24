import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import { createSelector } from 'reselect';
import { VIEWSHED_LAYER } from '../api.js';
import {
  grantedViewshed,
  type ViewshedGrants,
  viewshedRenderKey,
} from '../request.js';

/** Whether the overlay is on the map at all — most of the feature hangs on it. */
export const viewshedLayerActive = (state: RootState): boolean =>
  state.map.layers.includes(VIEWSHED_LAYER);

/**
 * What the account may actually have of the settings it asked for. Memoized, so
 * that everything speaking about the overlay — the request, the render key, the
 * controls, the link — reads one answer rather than repeating the premium
 * policy.
 */
export const viewshedGrantsSelector = createSelector(
  (state: RootState) => state.viewshedSettings,
  (state: RootState) => isPremium(state.auth.user),
  (settings, premium): ViewshedGrants => grantedViewshed(settings, premium),
);

/**
 * Whether the overlay on the map still answers for the controls. Derived from
 * the render's own key rather than tracked, so nothing has to set a dirty flag.
 */
export const viewshedOutdatedSelector = createSelector(
  (state: RootState) => state.viewshed.viewpoint,
  (state: RootState) => state.viewshed.render,
  (state: RootState) => state.viewshedSettings,
  viewshedGrantsSelector,
  (viewpoint, render, settings, grants) =>
    viewpoint !== null &&
    (render === null ||
      render.key !== viewshedRenderKey(viewpoint, settings, grants)),
);
