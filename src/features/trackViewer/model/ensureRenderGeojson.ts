import { clearMapFeatures } from '@app/store/actions.js';
import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { densifyAlong } from '@shared/elevation.js';
import type { Feature, LineString, MultiLineString } from 'geojson';
import type { Dispatch } from 'redux';
import {
  trackViewerDelete,
  trackViewerSetData,
  trackViewerSetRenderGeojson,
} from './actions.js';

// A multi-segment recording arrives as a single `MultiLineString` feature; it
// densifies per segment.
const isLine = (f: Feature): f is Feature<LineString | MultiLineString> =>
  f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString';

/**
 * Lazily builds the densified render copy of the loaded track and caches it via
 * {@link trackViewerSetRenderGeojson}. Runs **only after a server elevation
 * override** (`elevationDecision === 'all'`): that is the one state where every
 * point is known to be DEM-derived, so inserting DEM-sampled points between
 * vertices adds no recorded-vs-DEM seam. A track's own recorded elevation is
 * left alone (even when full) rather than have DEM injected between its measured
 * points, as are *fill missing* and *keep recorded*. It is also a no-op for a
 * dense track (no long segments to subdivide), leaving consumers reading
 * `trackGeojson`.
 */
export async function ensureRenderGeojson(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
): Promise<void> {
  const { trackGeojson, renderTrackGeojson, elevationDecision } =
    getState().trackViewer;

  if (renderTrackGeojson || !trackGeojson || elevationDecision !== 'all') {
    return;
  }

  const lines = trackGeojson.features.filter(isLine);

  if (lines.length === 0) {
    return;
  }

  const densified = await Promise.all(
    lines.map((line) =>
      densifyAlong(line, getState, [
        trackViewerSetData,
        trackViewerDelete,
        clearMapFeatures,
      ]),
    ),
  );

  // Nothing was long enough to subdivide → dense track, leave the cache empty.
  if (densified.every((line, i) => line === lines[i])) {
    return;
  }

  // The track may have been replaced (or the cache filled by a concurrent call)
  // while sampling.
  const after = getState().trackViewer;

  if (after.trackGeojson !== trackGeojson || after.renderTrackGeojson) {
    return;
  }

  let i = 0;

  const features = trackGeojson.features.map((f) =>
    isLine(f) ? densified[i++]! : f,
  );

  dispatch(trackViewerSetRenderGeojson({ ...trackGeojson, features }));
}
