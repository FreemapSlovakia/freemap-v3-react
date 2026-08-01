import { setActiveModal, setTool } from '@app/store/actions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { FeatureCollection } from 'geojson';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { dataViewerSetData, dataViewerSetTrackUID } from '../model/actions.js';
import { parseDataFiles } from '../parseDataFiles.js';
import { loadDataViewerMessages } from '../translations/loadDataViewerMessages.js';
import { useDataMergeMode } from './useDataMergeMode.js';

/**
 * Returns a handler that imports one or more track files of any supported
 * format and merges them into the track viewer. When geodata is already shown
 * it asks (via the confirm dialog) whether to append the new data or replace
 * what's loaded; with nothing loaded it imports straight away. Used by both the
 * import modal and the app-wide file drop, so the merge prompt behaves the same
 * regardless of how the files arrive.
 */
export function useLoadDataFiles(): (files: File[]) => Promise<void> {
  const dispatch = useDispatch();

  const askMergeMode = useDataMergeMode();

  const existing = useAppSelector((state) => state.trackViewer.trackGeojson);

  return useCallback(
    async (files) => {
      if (files.length === 0) {
        return;
      }

      const { merged, failed } = await parseDataFiles(files);

      if (failed.length) {
        dispatch(
          toastsAdd({
            id: 'dataViewer.loadError',
            messageKey: merged ? 'someFilesFailed' : 'invalidFormat',
            messageParams: { names: failed.join(', ') },
            messageLoader: loadDataViewerMessages,
            style: 'danger',
          }),
        );
      }

      if (!merged) {
        return;
      }

      const mode = await askMergeMode();

      if (mode === 'cancel') {
        return;
      }

      const trackGeojson: FeatureCollection =
        mode === 'append' && existing
          ? {
              type: 'FeatureCollection',
              features: [...existing.features, ...merged.features],
            }
          : merged;

      dispatch(elevationChartClose());

      // A fresh local import has no server-shared track id.
      dispatch(dataViewerSetTrackUID(null));

      dispatch(dataViewerSetData({ trackGeojson, focus: true }));

      dispatch(setActiveModal(null));

      dispatch(setTool('import-file'));
    },
    [dispatch, askMergeMode, existing],
  );
}
