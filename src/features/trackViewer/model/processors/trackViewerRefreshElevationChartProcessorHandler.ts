import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartSetTrackGeojson } from '@features/elevationChart/model/actions.js';
import { Feature, LineString, MultiLineString } from 'geojson';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

// A multi-segment recording arrives as a single `MultiLineString` feature.
const isLineLike = (f: Feature): f is Feature<LineString | MultiLineString> =>
  f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString';

const handle: ProcessorHandler = async ({ dispatch, getState }) => {
  // Re-densify against the freshly overridden elevation (the cache was just
  // invalidated by the elevation change) so the chart stays high-resolution.
  await ensureRenderGeojson(getState, dispatch);

  const { renderTrackGeojson, trackGeojson } = getState().trackViewer;

  const first =
    renderTrackGeojson?.features.find(isLineLike) ??
    trackGeojson?.features.find(isLineLike);

  if (first) {
    dispatch(elevationChartSetTrackGeojson(first, true));
  }
};

export default handle;
