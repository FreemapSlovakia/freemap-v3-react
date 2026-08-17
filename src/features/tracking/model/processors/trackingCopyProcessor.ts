import { openTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerSetData,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { FeatureCollection } from 'geojson';
import { tracksToFeatureCollection } from '../../trackGeojson.js';
import { resolveTracks } from '../../tracks.js';
import { trackingActions } from '../actions.js';

/**
 * Puts a snapshot of the live tracks into the track viewer, where they become
 * ordinary loaded tracks: elevation, colorize, the chart and every export
 * target then work on them without tracking knowing anything about it.
 *
 * A copy, not a hand-over — unlike a finished recording, the feed goes on, so
 * the watched devices stay exactly as they are.
 */
export const trackingCopyToDataViewerProcessor: Processor<
  typeof trackingActions.copyToDataViewer
> = {
  actionCreator: trackingActions.copyToDataViewer,
  handle: ({ getState, dispatch, action }) => {
    const { token, mode } = action.payload;

    const state = getState();

    const copied = tracksToFeatureCollection(
      resolveTracks(
        state.tracking.tracks,
        state.tracking.trackedDevices,
      ).filter((track) => token === undefined || track.token === token),
    );

    if (copied.features.length === 0) {
      return;
    }

    trackMatomo(['trackEvent', 'Tracking', 'copyToDataViewer', mode]);

    const existing = state.trackViewer.trackGeojson;

    const trackGeojson: FeatureCollection =
      mode === 'append' && existing
        ? {
            type: 'FeatureCollection',
            features: [...existing.features, ...copied.features],
          }
        : copied;

    // Not a server-shared track, so it carries no id to share it back by.
    dispatch(dataViewerSetTrackUID(null));

    dispatch(dataViewerSetData({ trackGeojson }));

    // The copy is worked on from the track viewer's own toolbar.
    dispatch(openTool('import-file'));
  },
};
