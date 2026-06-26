import { setActiveModal, setTool } from '@app/store/actions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useConfirmChoice } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { FeatureCollection } from 'geojson';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '../model/actions.js';
import { parseTrackFiles } from '../parseTrackFiles.js';
import { loadTrackViewerMessages } from '../translations/loadTrackViewerMessages.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';

/**
 * Returns a handler that imports one or more track files of any supported
 * format and merges them into the track viewer. When geodata is already shown
 * it asks (via the confirm dialog) whether to append the new data or replace
 * what's loaded; with nothing loaded it imports straight away. Used by both the
 * import modal and the app-wide file drop, so the merge prompt behaves the same
 * regardless of how the files arrive.
 */
export function useLoadTrackFiles(): (files: File[]) => Promise<void> {
  const dispatch = useDispatch();

  const confirmChoice = useConfirmChoice();

  const tvm = useTrackViewerMessages();

  const existing = useAppSelector((state) => state.trackViewer.trackGeojson);

  return useCallback(
    async (files) => {
      if (files.length === 0) {
        return;
      }

      const { merged, failed } = await parseTrackFiles(files);

      if (failed.length) {
        dispatch(
          toastsAdd({
            id: 'trackViewer.loadError',
            messageKey: merged ? 'someFilesFailed' : 'invalidFormat',
            messageParams: { names: failed.join(', ') },
            messageLoader: loadTrackViewerMessages,
            style: 'danger',
            timeout: 5000,
          }),
        );
      }

      if (!merged) {
        return;
      }

      let mode: 'replace' | 'append' = 'replace';

      // Already showing data → let the user choose. Append is the safe default
      // (confirm / Enter); replace is the destructive option.
      if (existing) {
        const choice = await confirmChoice({
          title: tvm?.uploadModal.mergeTitle,
          message: tvm?.uploadModal.mergeMessage,
          confirmLabel: tvm?.uploadModal.append,
          extraLabel: tvm?.uploadModal.replace,
          extraStyle: 'danger',
        });

        if (choice === 'cancel') {
          return;
        }

        mode = choice === 'extra' ? 'replace' : 'append';
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
      dispatch(trackViewerSetTrackUID(null));

      dispatch(trackViewerSetData({ trackGeojson, focus: true }));

      dispatch(setActiveModal(null));

      dispatch(setTool({ tool: 'import-file', mode: 'open' }));
    },
    [dispatch, confirmChoice, tvm, existing],
  );
}
