import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartSetTrackGeojson } from '@features/elevationChart/model/actions.js';
import {
  trackViewerResolveElevationPrompt,
  trackViewerSetElevation,
} from '@features/trackViewer/model/actions.js';
import { enrichElevations } from '@shared/elevation.js';
import { Feature, LineString } from 'geojson';

export const trackViewerResolveElevationPromptProcessor: Processor<
  typeof trackViewerResolveElevationPrompt
> = {
  actionCreator: trackViewerResolveElevationPrompt,
  handle: async ({ dispatch, getState, action }) => {
    const { trackGeojson } = getState().trackViewer;

    if (!trackGeojson) {
      return;
    }

    const lineFeatures = trackGeojson.features.filter(
      (f): f is Feature<LineString> => f.geometry.type === 'LineString',
    );

    const { mode } = action.payload;

    // 'keep' opens the chart on the recorded elevation as-is; 'missing'/'all'
    // fetch from the server first and cache the result back into trackGeojson
    // so the chart, colorize and export all reuse it.
    let lines = lineFeatures;

    if (mode !== 'keep') {
      lines = await enrichElevations(lineFeatures, mode, getState);

      let i = 0;

      const features = trackGeojson.features.map((f) =>
        f.geometry.type === 'LineString' ? lines[i++]! : f,
      );

      dispatch(trackViewerSetElevation({ ...trackGeojson, features }));
    }

    // Open the chart on the first line. If the server still had no data for
    // some points, the chart's own API path fills the remainder.
    const first = lines[0];

    if (first) {
      window._paq.push(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      dispatch(elevationChartSetTrackGeojson(first));
    }
  },
};
