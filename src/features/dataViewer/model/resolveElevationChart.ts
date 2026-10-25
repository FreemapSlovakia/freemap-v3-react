import type { ProfileResolver } from '@features/elevationChart/model/resolve.js';
import { elevationCoverage } from '@shared/geoutils.js';
import {
  isTrackLine,
  resolveActiveTrack,
  trackWaypoints,
} from '../trackSelection.js';
import { elevationCredit } from './elevationCredit.js';
import { buildLines } from './renderLines.js';

/** The active line, as its render copy draws it (`renderLines.ts`). */
const resolve: ProfileResolver = async (getState, dispatch) => {
  const first = getState().trackViewer;

  const shown = resolveActiveTrack(first.trackGeojson, first.activeTrackIndex);

  if (shown) {
    try {
      await buildLines(getState, dispatch, [shown.index]);
    } catch (err) {
      // The stored line stands in, or the chart samples one without elevation.
      console.warn('Sampling the line for its profile failed:', err);
    }
  }

  const trackViewer = getState().trackViewer;

  const { trackGeojson, renderTrackGeojson, activeTrackIndex } = trackViewer;

  const active = resolveActiveTrack(trackGeojson, activeTrackIndex);

  if (!active) {
    // Still on its way where the URL names the track, or where this browser's
    // own stored copy is being read back. A reload asks for the restore *after*
    // it asks for the chart, but in the same synchronous run, and every resolver
    // loads behind a dynamic import — so the flag is always set by the time this
    // reads it. Anything else means the track the chart showed is gone.
    return !trackGeojson &&
      (trackViewer.trackUID ||
        trackViewer.gpxUrl ||
        trackViewer.restoringStored)
      ? { status: 'pending' }
      : { status: 'gone' };
  }

  const rendered = renderTrackGeojson?.features[active.index];

  const drawn = rendered && isTrackLine(rendered) ? rendered : active.feature;

  // A line with no elevation of its own — a drawn one, typically — is sampled
  // from the elevation API, and nothing is written into it.
  const sampled = elevationCoverage([drawn]) === 'none';

  return {
    status: 'ok',
    source: {
      trackGeojson: drawn,
      // Recorded elevation is shown as-is, gaps included; a fill or override has
      // already written the server's values into these same coordinates.
      keepRecorded: !sampled,
      waypoints: trackWaypoints(trackGeojson),
      credit: sampled
        ? { provenance: 'terrain-model' }
        : elevationCredit(trackViewer, drawn),
    },
  };
};

export default resolve;
