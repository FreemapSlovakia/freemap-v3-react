import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartSetTrackGeojson } from '@features/elevationChart/model/actions.js';
import { isTrackLine, resolveActiveTrack } from '../../trackSelection.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

const handle: ProcessorHandler = async ({ dispatch, getState }) => {
  // Re-densify against the freshly overridden elevation (the cache was just
  // invalidated by the elevation change) so the chart stays high-resolution.
  await ensureRenderGeojson(getState, dispatch);

  const { trackGeojson, renderTrackGeojson, selectedTrackIndex } =
    getState().trackViewer;

  const active = resolveActiveTrack(trackGeojson, selectedTrackIndex);

  if (!active) {
    return;
  }

  const rendered = renderTrackGeojson?.features[active.index];

  dispatch(
    elevationChartSetTrackGeojson(
      rendered && isTrackLine(rendered) ? rendered : active.feature,
      true,
    ),
  );
};

export default handle;
