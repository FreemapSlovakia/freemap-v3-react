import type { ProfileResolver } from '@features/elevationChart/model/resolve.js';
import { selectRecorderSegments } from './model/selectors.js';
import { gpsRecorderPlatformSupported } from './support.js';
import { recorderSegmentsToProfileFeature } from './trackGeojson.js';

/**
 * The recording as it stands, drawn while it is still the recorder's: the same
 * segments the map draws, so a pause breaks the profile exactly where it breaks
 * the line.
 *
 * Nothing is fetched or cached — the recorded altitude is what the profile is
 * for, and it grows a fix at a time. Once the ride is finished the track belongs
 * to the track viewer, whose own chart takes over.
 */
const resolve: ProfileResolver = async (getState) => {
  const state = getState();

  if (state.elevationChart.target?.type !== 'gps-recorder') {
    return { status: 'gone' };
  }

  const trackGeojson = recorderSegmentsToProfileFeature(
    selectRecorderSegments(state),
  );

  if (!trackGeojson) {
    // Nothing to draw yet, and whether anything ever will be is what tells the
    // two answers apart: a recording still warming up, fixes that carry no
    // altitude so far, or a recorder that hasn't been heard from at all — a
    // reload restores this target from the URL while the whole track is still
    // being refetched — may all yet supply one. Only an empty track the
    // recorder has already reported on has been deleted or handed over, and on
    // a platform the recorder cannot run on nothing is coming either.
    return state.gpsRecorder.points.length > 0 ||
      state.gpsRecorder.status?.recording ||
      (state.gpsRecorder.status === null && gpsRecorderPlatformSupported)
      ? { status: 'pending' }
      : { status: 'gone' };
  }

  return {
    status: 'ok',
    source: {
      trackGeojson,
      // The measured altitude, shown as it was recorded: gaps included, and no
      // terrain model consulted for a track that carries its own.
      keepRecorded: true,
      waypoints: [],
      credit: { provenance: 'recorded' },
    },
  };
};

export default resolve;
