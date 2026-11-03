import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerAddFeatures,
  dataViewerSetData,
} from '@features/dataViewer/model/actions.js';
import { soleTrackLine } from '@features/dataViewer/trackSelection.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import bbox from '@turf/bbox';

export const dataViewerSetTrackDataProcessor: Processor<
  typeof dataViewerSetData
> = {
  actionCreator: dataViewerSetData,
  transform: ({ action, dispatch }) => {
    const { focus, trackGeojson } = action.payload;

    if (focus && trackGeojson) {
      let bounds;

      try {
        bounds = bbox(trackGeojson);
      } catch {}

      if (bounds) {
        fitMapToBbox(dispatch, [bounds[0], bounds[1], bounds[2], bounds[3]]);
      }
    }

    return action;
  },
  // After the reducer, which drops the selection the old indices named.
  handle: ({ action, dispatch }) => {
    const line = action.payload.select
      ? soleTrackLine(action.payload.trackGeojson)
      : undefined;

    if (line) {
      dispatch(selectFeature({ type: 'feature', id: line.index }));
    }
  },
};

/** Selects the first of the features added, where asked to. */
export const dataViewerAddFeaturesProcessor: Processor<
  typeof dataViewerAddFeatures
> = {
  actionCreator: dataViewerAddFeatures,
  handle: ({ action, dispatch, getState }) => {
    const count = getState().trackViewer.trackGeojson?.features.length ?? 0;

    const { features, select } = action.payload;

    if (select && features.length > 0) {
      dispatch(selectFeature({ type: 'feature', id: count - features.length }));
    }
  },
};
