import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { makeFixProcessor } from '@features/location/model/makeFixProcessor.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import {
  clearViewshedImageUrl,
  dropViewshedRenderClaim,
} from '../renderHolder.js';
import {
  viewshedCancel,
  viewshedClear,
  viewshedPick,
  viewshedRender,
  viewshedSetPickingViewpoint,
} from './actions.js';
import { viewshedLayerActive } from './selectors.js';

export const viewshedRenderProcessor: Processor = {
  actionCreator: [viewshedPick, viewshedRender],
  id: 'viewshed',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "viewshed-render-processor-handler" */
        './renderHandler.js'
      )
    ).default(...params),
};

/** Stands the eye where the fix landed, which also renders. */
export const viewshedFixProcessor = makeFixProcessor(
  'viewshed',
  viewshedLayerActive,
  (_, at) => viewshedPick(at),
);

/**
 * Turning the layer on with nowhere to look from asks where; turning it off
 * gives up the render in flight. The viewpoint stays either way, so turning the
 * layer back on finds the overlay still there.
 */
export const viewshedLayerProcessor: Processor = {
  stateChangePredicate: viewshedLayerActive,
  handle: async ({ getState, dispatch, action }) => {
    const { viewshed } = getState();

    if (!viewshedLayerActive(getState())) {
      dispatch(viewshedCancel());

      if (viewshed.pickingViewpoint) {
        dispatch(viewshedSetPickingViewpoint(false));
      }
    } else if (!viewshed.viewpoint && mapToggleLayer.match(action)) {
      // Only a direct toggle, not a link's `mapRefocus`: taking the map over on
      // page load would be rude, and the link may name a viewpoint anyway.
      dispatch(viewshedSetPickingViewpoint(true));
    }
  },
};

/**
 * Releases the overlay image once the viewshed is given up on: the map cleared,
 * or `viewshedClear`, which the URL dispatches when the param goes.
 */
export const viewshedReleaseProcessor: Processor = {
  actionCreator: [clearMapFeatures, viewshedClear],
  handle: () => {
    clearViewshedImageUrl();
  },
};

/**
 * A cancelled render must not land after the fact; the picture already on the
 * map stays, which is why this is not the release above.
 */
export const viewshedCancelProcessor: Processor = {
  actionCreator: viewshedCancel,
  handle: () => {
    dropViewshedRenderClaim();
  },
};
