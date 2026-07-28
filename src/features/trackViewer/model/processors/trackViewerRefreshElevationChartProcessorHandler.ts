import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartSetTrackGeojson,
  elevationSetSettings,
} from '@features/elevationChart/model/actions.js';
import {
  isTrackLine,
  resolveActiveTrack,
  trackWaypoints,
} from '../../trackSelection.js';
import { elevationCredit } from '../elevationCredit.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

const handle: ProcessorHandler = async ({ dispatch, getState, action }) => {
  // Only refresh a chart that's actually open (the trigger fires on any track
  // change, chart or not).
  if (!getState().elevationChart.elevationProfilePoints) {
    return;
  }

  // Changed elevation settings re-derive an open chart. Whichever tool is in
  // use owns it, so stand aside when it isn't this one.
  if (
    elevationSetSettings.match(action) &&
    !getState().main.tools.includes('import-file')
  ) {
    return;
  }

  // Re-densify against the freshly overridden elevation (the cache was just
  // invalidated by the elevation change) so the chart stays high-resolution.
  await ensureRenderGeojson(getState, dispatch);

  const trackViewer = getState().trackViewer;

  const { trackGeojson, renderTrackGeojson, selectedTrackIndex } = trackViewer;

  const active = resolveActiveTrack(trackGeojson, selectedTrackIndex);

  if (!active) {
    return;
  }

  const rendered = renderTrackGeojson?.features[active.index];

  const drawn = rendered && isTrackLine(rendered) ? rendered : active.feature;

  dispatch(
    elevationChartSetTrackGeojson(
      drawn,
      true,
      trackWaypoints(trackGeojson),
      elevationCredit(trackViewer, drawn),
    ),
  );
};

export default handle;
