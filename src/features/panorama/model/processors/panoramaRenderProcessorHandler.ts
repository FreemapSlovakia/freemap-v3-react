import { clearMapFeatures, closeTool } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { isAbortError } from '@shared/isAbortError.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import type { Dispatch } from 'redux';
import { panoramaErrorCode, renderPanorama } from '../../api.js';
import { labelsFromPeaks } from '../../labels/fromPeaks.js';
import type { PanoramaLabel } from '../../labels/types.js';
import {
  buildPanoramaRequest,
  grantedPanorama,
  PANORAMA_PREVIEW_QUALITY,
  type PanoramaGrants,
  panoramaRenderKey,
} from '../../quality.js';
import {
  claimPanoramaRender,
  isCurrentPanoramaRender,
  setPanoramaRenderData,
} from '../../renderHolder.js';
import {
  panoramaCancel,
  panoramaClear,
  panoramaPick,
  panoramaRender,
  panoramaSetError,
  panoramaSetProgress,
  panoramaSetRender,
  panoramaSetRendering,
} from '../actions.js';
import type { PanoramaSettingsState } from '../settingsReducer.js';

/**
 * What makes the render in flight pointless. Hanging up stops the work on the
 * server too, so a user who reframes the view doesn't queue behind their own
 * abandoned render.
 */
const CANCEL: CancelTriggers = {
  cancelActions: [
    panoramaPick,
    panoramaRender,
    panoramaCancel,
    panoramaClear,
    clearMapFeatures,
  ],
  actionPredicate: (action) =>
    closeTool.match(action) && action.payload === 'panorama',
};

/** One pass's names, and the frame they were measured in; see {@link carryOver}. */
type PassLabels = {
  labels: PanoramaLabel[];
  altMax: number;
  stepDeg: number;
};

/**
 * The cheap pass's names in the detailed pass's pixels. `y` is
 * `(alt_max − altitude) / step`, so a pass at a finer step puts the same summit
 * lower down the taller image; the band is normally the same, but reading both
 * costs nothing and survives one that isn't.
 */
function carryOver(from: PassLabels, to: Omit<PassLabels, 'labels'>) {
  return from.stepDeg === to.stepDeg && from.altMax === to.altMax
    ? from.labels
    : from.labels.map((label) => ({
        ...label,
        y: (label.y * from.stepDeg + (to.altMax - from.altMax)) / to.stepDeg,
      }));
}

/**
 * One render, of what was asked for rather than of whatever the state says by
 * the time it runs. The two passes are up to forty seconds apart, and dragging
 * the eye marker moves the viewpoint without cancelling or starting anything —
 * so re-reading the state here would have the second pass quietly render
 * somewhere the user never asked to see, and record it as though they had.
 *
 * `carried` are the names an earlier pass already answered with, which this one
 * then does not ask for. Answers with its own names, or `null` where something
 * has replaced this render since and there is nothing more to do.
 */
async function renderPass(
  viewpoint: LatLon,
  settings: PanoramaSettingsState,
  grants: PanoramaGrants,
  preview: boolean,
  carried: PassLabels | null,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<PassLabels | null> {
  const id = claimPanoramaRender();

  const { meta, imageUrl, depth } = await renderPanorama(
    buildPanoramaRequest(viewpoint, settings, grants, !carried),
    getState,
    CANCEL,
    (progress) => dispatch(panoramaSetProgress(progress)),
  );

  if (!isCurrentPanoramaRender(id)) {
    URL.revokeObjectURL(imageUrl);

    return null;
  }

  setPanoramaRenderData({ id, imageUrl, depth });

  const frame = { altMax: meta.alt_max, stepDeg: meta.step_deg };

  const labels = carried
    ? carryOver(carried, frame)
    : labelsFromPeaks(meta.peaks ?? []);

  dispatch(
    panoramaSetRender({
      id,
      viewpoint,
      key: panoramaRenderKey(viewpoint, settings, grants),
      preview,
      eyeElevation: meta.eye_elevation,
      width: meta.width,
      height: meta.height,
      azStart: meta.az_start,
      altMin: meta.alt_min,
      altMax: meta.alt_max,
      stepDeg: meta.step_deg,
      depthLift: settings.depthLift,
      labels,
    }),
  );

  return { labels, ...frame };
}

const handle: ProcessorHandler = async ({ getState, dispatch }) => {
  const { viewpoint } = getState().panorama;

  if (!viewpoint) {
    return;
  }

  const settings = getState().panoramaSettings;

  // The finer tiers and the farther views are premium's. Asking for more
  // without it would only have the service clamp it back, so the request says
  // what the account can have.
  const grants = grantedPanorama(settings, isPremium(getState().auth.user));

  trackMatomo(['trackEvent', 'Panorama', 'render', grants.quality]);

  dispatch(panoramaSetRendering(true));

  try {
    // The cheapest pass first, so a long render happens behind a picture the
    // user can already turn around in. Always, not by preference: that pass is
    // the coarsest tier there is, so it adds a few percent to a detailed render
    // rather than the third again it would cost were it a middling one.
    //
    // It is also the only pass that asks for peaks: that halves the peak
    // payload and spares the detailed render a peak pass costing it about two
    // seconds. It settles the names as well, which no longer costs what it
    // once did — the service now measures dominance on a grid of its own — but
    // visibility is still decided by the rays a tier happened to cast, and a
    // near-level neighbourhood can still swing a score. Four of the top forty
    // labels changed under the second pass at an Ötztal viewpoint.
    //
    // The trade is that the coarse pass answers for visibility too, so a summit
    // the detailed picture draws behind a ridge can still carry a name.
    let carried: PassLabels | null = null;

    if (grants.quality !== PANORAMA_PREVIEW_QUALITY) {
      carried = await renderPass(
        viewpoint,
        settings,
        { ...grants, quality: PANORAMA_PREVIEW_QUALITY },
        true,
        null,
        getState,
        dispatch,
      );

      if (!carried) {
        return;
      }
    }

    if (
      !(await renderPass(
        viewpoint,
        settings,
        grants,
        false,
        carried,
        getState,
        dispatch,
      ))
    ) {
      return;
    }
  } catch (err) {
    // An abort means something newer already owns the flag — the render that
    // replaced this one, or the panel closing. Clearing it here would say the
    // panel is idle while the next render is running.
    if (!isAbortError(err)) {
      dispatch(panoramaSetError(panoramaErrorCode(err)));
    }

    return;
  }

  dispatch(panoramaSetRendering(false));
};

export default handle;
