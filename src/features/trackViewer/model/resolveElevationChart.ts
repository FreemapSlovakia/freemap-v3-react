import type { ProfileResolver } from '@features/elevationChart/model/resolve.js';
import {
  isTrackLine,
  resolveActiveTrack,
  trackWaypoints,
} from '../trackSelection.js';
import { elevationCredit } from './elevationCredit.js';
import { ensureRenderGeojson } from './ensureRenderGeojson.js';

/** The active imported track, densified where it was elevation-overridden. */
const resolve: ProfileResolver = async (getState, dispatch) => {
  // Re-densify against the freshly overridden elevation (the cache is
  // invalidated by an elevation change) so the chart stays high-resolution.
  await ensureRenderGeojson(getState, dispatch);

  const trackViewer = getState().trackViewer;

  const { trackGeojson, renderTrackGeojson, selectedTrackIndex } = trackViewer;

  const active = resolveActiveTrack(trackGeojson, selectedTrackIndex);

  if (!active) {
    // A track the URL also names is still on its way; anything else means the
    // track the chart showed is gone (a local import isn't in the URL, so a
    // reload can never bring it back).
    return !trackGeojson && (trackViewer.trackUID || trackViewer.gpxUrl)
      ? { status: 'pending' }
      : { status: 'gone' };
  }

  const rendered = renderTrackGeojson?.features[active.index];

  const drawn = rendered && isTrackLine(rendered) ? rendered : active.feature;

  return {
    status: 'ok',
    source: {
      trackGeojson: drawn,
      // Recorded elevation is shown as-is, gaps included; a fill or override has
      // already written the server's values into these same coordinates.
      keepRecorded: true,
      waypoints: trackWaypoints(trackGeojson),
      credit: elevationCredit(trackViewer, drawn),
    },
  };
};

export default resolve;
