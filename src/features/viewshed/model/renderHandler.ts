import { clearMapFeatures } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { isPremium } from '@features/premium/premium.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { isAbortError } from '@shared/isAbortError.js';
import { terrainErrorCode } from '@shared/terrainService.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { renderViewshed } from '../api.js';
import {
  claimViewshedRender,
  isCurrentViewshedRender,
  setViewshedImageUrl,
} from '../renderHolder.js';
import {
  buildViewshedRequest,
  grantedViewshed,
  viewshedRenderKey,
} from '../request.js';
import {
  viewshedCancel,
  viewshedClear,
  viewshedPick,
  viewshedRender,
  viewshedSetError,
  viewshedSetProgress,
  viewshedSetRender,
  viewshedSetRendering,
} from './actions.js';
import { viewshedLayerActive } from './selectors.js';

/**
 * What makes the render in flight pointless. Hanging up stops the work on the
 * server too, so a user who moves the eye doesn't queue behind their own
 * abandoned render.
 */
const CANCEL: CancelTriggers = {
  cancelActions: [
    viewshedPick,
    viewshedRender,
    viewshedCancel,
    viewshedClear,
    clearMapFeatures,
  ],
  // The layer going takes the render with it, however it went — a press on the
  // toolbar's close, a keyboard shortcut, or a link that names other layers.
  stateChangePredicate: viewshedLayerActive,
};

const handle: ProcessorHandler = async ({ getState, dispatch }) => {
  const { viewpoint } = getState().viewshed;

  if (!viewpoint) {
    return;
  }

  const settings = getState().viewshedSettings;

  // The finer tiers and the wider views are premium's. The service clamps
  // neither, so this is what keeps the request to what the account can have.
  const grants = grantedViewshed(settings, isPremium(getState().auth.user));

  trackMatomo(['trackEvent', 'Viewshed', 'render', grants.detail]);

  dispatch(viewshedSetRendering(true));

  const id = claimViewshedRender();

  try {
    const { meta, imageUrl } = await renderViewshed(
      buildViewshedRequest(viewpoint, settings, grants),
      getState,
      CANCEL,
      (progress) => dispatch(viewshedSetProgress(progress)),
    );

    if (!isCurrentViewshedRender(id)) {
      URL.revokeObjectURL(imageUrl);

      return;
    }

    setViewshedImageUrl(imageUrl);

    dispatch(
      viewshedSetRender({
        viewpoint,
        key: viewshedRenderKey(viewpoint, settings, grants),
        bounds: meta.bounds,
        eyeElevation: meta.eye_elevation,
      }),
    );
  } catch (err) {
    // An abort means something newer already owns the overlay — the render that
    // replaced this one, or the layer going. Clearing the flag here would say
    // the toolbar is idle while the next render is running.
    if (!isAbortError(err)) {
      dispatch(viewshedSetError(terrainErrorCode(err)));
    }
  }
};

export default handle;
