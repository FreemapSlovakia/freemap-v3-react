import type { ProfileResolver } from '@features/elevationChart/model/resolve.js';
import { hasElevation } from './chartTrack.js';
import { trackPointsToFeature } from './trackGeojson.js';

/**
 * The tracked device the target names. Found by token, so a changed selection
 * can't quietly swap the chart onto another device.
 */
const resolve: ProfileResolver = async (getState) => {
  const { target } = getState().elevationChart;

  if (target?.type !== 'tracking') {
    return { status: 'gone' };
  }

  const track = getState().tracking.tracks.find(
    ({ token }) => token === target.token,
  );

  // The same gate the toolbar button uses: without two real altitudes there is
  // no profile, only a line of NaN. A device that is still watched may yet
  // report them, so that is a wait rather than an end.
  if (!track || !hasElevation(track.trackPoints)) {
    return getState().tracking.trackedDevices.some(
      ({ token }) => token === target.token,
    )
      ? { status: 'pending' }
      : { status: 'gone' };
  }

  return {
    status: 'ok',
    source: {
      trackGeojson: trackPointsToFeature(track.trackPoints),
      // Recorded altitude is used as-is; live points stream in, so nothing is
      // fetched or cached.
      keepRecorded: true,
      waypoints: [],
      credit: { provenance: 'recorded' },
    },
  };
};

export default resolve;
