import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerSetElevationPrompt,
  dataViewerToggleElevationChart,
} from '@features/dataViewer/model/actions.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { resolveActiveTrack } from '../../trackSelection.js';

export const dataViewerToggleElevationChartProcessor: Processor = {
  actionCreator: dataViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.target?.type === 'track-viewer') {
      dispatch(elevationChartClose());

      return;
    }

    const { trackGeojson, elevationDecision, activeTrackIndex } =
      getState().trackViewer;

    const active = resolveActiveTrack(trackGeojson, activeTrackIndex);

    if (!active) {
      return;
    }

    // Prompt only for partial elevation not yet decided on; full or none opens
    // the chart at once (none sampled from the API), and a track kept partial
    // shows its gaps.
    if (
      elevationDecision !== 'undecided' ||
      elevationCoverage([active.feature]) !== 'partial'
    ) {
      // `elevationChartProcessor` draws it from here — it densifies a sparse
      // line and states the credit, so the toggle and a URL-restored chart take
      // one path.
      dispatch(elevationChartOpen({ type: 'track-viewer' }));

      return;
    }

    dispatch(dataViewerSetElevationPrompt({ type: 'chart' }));
  },
};
