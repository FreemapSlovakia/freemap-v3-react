import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartSetTrackGeojson,
  elevationSetSettings,
} from './actions.js';

/**
 * Recomputes an open profile that samples the elevation API itself — a drawn
 * line or a measurement (`keepRecorded: false`) — when the settings it is
 * filtered by change. Its inputs don't change with the settings, so replaying
 * the stored request is enough.
 *
 * A profile rendered from a feature's own elevation (`keepRecorded: true`) is
 * left to whichever feature owns it: replaying the request would redraw the
 * geometry cached *before* the settings invalidated it.
 */
export const elevationChartResampleProcessor: Processor<
  typeof elevationSetSettings
> = {
  actionCreator: elevationSetSettings,
  errorKey: 'elevationChart.fetchError',
  handle: async ({ dispatch, getState }) => {
    const { elevationProfilePoints, request } = getState().elevationChart;

    if (!elevationProfilePoints || !request || request.keepRecorded) {
      return;
    }

    dispatch(
      elevationChartSetTrackGeojson(
        request.trackGeojson,
        false,
        request.waypoints,
      ),
    );
  },
};
