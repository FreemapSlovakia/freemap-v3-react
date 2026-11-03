import { clearMapFeatures, closeTool } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { isAbortError } from '@shared/isAbortError.js';
import { terrainErrorCode } from '@shared/terrainService.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import type { Dispatch } from 'redux';
import { type PanoramaMeta, renderPanorama } from '../../api.js';
import { labelsFromPeaks } from '../../labels/fromPeaks.js';
import {
  buildPanoramaRequest,
  grantedPanorama,
  type PanoramaGrants,
  panoramaRenderKey,
} from '../../quality.js';
import {
  claimPanoramaRender,
  isCurrentPanoramaRender,
  setPanoramaRenderData,
} from '../../renderHolder.js';
import { setPanoramaProgress } from '../../viewStore.js';
import {
  panoramaCancel,
  panoramaClear,
  panoramaPick,
  panoramaRender,
  panoramaSetError,
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

/**
 * One render, of what was asked for rather than of whatever the state says by
 * the time it runs: a render is tens of seconds, and dragging the eye marker
 * moves the viewpoint without cancelling or starting anything — so re-reading
 * the state here would publish a picture of somewhere the user never asked to
 * see, and record it as though they had.
 *
 * Answers with what the service said of it, or `null` where something has
 * replaced this render since and there is nothing more to do.
 */
async function renderPass(
  viewpoint: LatLon,
  settings: PanoramaSettingsState,
  grants: PanoramaGrants,
  renderAz: number,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<PanoramaMeta | null> {
  const id = claimPanoramaRender();

  const { meta, bitmap, depth } = await renderPanorama(
    buildPanoramaRequest(viewpoint, settings, grants, renderAz),
    getState,
    CANCEL,
    setPanoramaProgress,
    () => isCurrentPanoramaRender(id),
  );

  if (!isCurrentPanoramaRender(id)) {
    bitmap?.close();

    return null;
  }

  // A picture that would not decode is a failed render, not a blank panel: the
  // viewer has nothing to draw, and every readout it carries answers for pixels
  // that are not there.
  if (!bitmap) {
    throw new Error('panorama image could not be decoded');
  }

  setPanoramaRenderData({ id, bitmap, depth });

  dispatch(
    panoramaSetRender({
      id,
      viewpoint,
      key: panoramaRenderKey(viewpoint, settings, grants, renderAz),
      eyeElevation: meta.eye_elevation,
      width: meta.width,
      height: meta.height,
      azStart: meta.az_start,
      fov: meta.fov,
      altMin: meta.alt_min,
      altMax: meta.alt_max,
      stepDeg: meta.step_deg,
      depthLift: settings.depthLift,
      rangeM: grants.rangeKm * 1000,
      attributions: meta.sources,
      labels: labelsFromPeaks(meta.peaks ?? []),
    }),
  );

  return meta;
}

const handle: ProcessorHandler = async ({ getState, dispatch }) => {
  const { viewpoint, renderAz } = getState().panorama;

  if (!viewpoint) {
    return;
  }

  // Whatever the pass that ended last said. The panel only shows this while a
  // render is in flight, but the first tick of the new one is a second or two
  // off and the old phase would stand in for it.
  setPanoramaProgress(null);

  const settings = getState().panoramaSettings;

  // The finer tiers and the farther views are premium's, and nothing on the
  // service's side says so, so the request is where the account is held to what
  // it may have.
  const grants = grantedPanorama(settings, isPremium(getState().auth.user));

  trackMatomo([
    'trackEvent',
    'Panorama',
    'render',
    `${Math.round(grants.pxPerDeg)}px/°×${grants.raysPerPixel}`,
  ]);

  dispatch(panoramaSetRendering(true));

  try {
    if (
      !(await renderPass(
        viewpoint,
        settings,
        grants,
        renderAz,
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
      dispatch(panoramaSetError(terrainErrorCode(err)));
    }

    return;
  }

  dispatch(panoramaSetRendering(false));
};

export default handle;
