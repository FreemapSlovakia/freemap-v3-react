import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartSetTrackGeojson } from '@features/elevationChart/model/actions.js';
import {
  trackViewerResolveElevationPrompt,
  trackViewerSetData,
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

    const enriched = await enrichElevations(
      lineFeatures,
      action.payload.mode,
      getState,
    );

    // Splice the enriched lines back into the collection (other features
    // untouched) and cache the result so the chart, colorize and export all
    // reuse it.
    let i = 0;

    const features = trackGeojson.features.map((f) =>
      f.geometry.type === 'LineString' ? enriched[i++]! : f,
    );

    dispatch(
      trackViewerSetData({ trackGeojson: { ...trackGeojson, features } }),
    );

    // Open the chart on the now-enriched first line. If the server still had no
    // data for some points, the chart's own API path fills the remainder.
    const first = enriched[0];

    if (first) {
      window._paq.push(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      dispatch(elevationChartSetTrackGeojson(first));
    }
  },
};
