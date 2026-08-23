import {
  convertToDataViewer,
  type DataViewerSource,
} from '@app/store/actions.js';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDataMergeMode } from './useDataMergeMode.js';

/**
 * Asks how the incoming features should meet what the viewer already holds, then
 * hands them over — the one gesture every menu that converts to "Tracks and
 * data" performs.
 */
export function useConvertToDataViewer(): (source: DataViewerSource) => void {
  const askMergeMode = useDataMergeMode();

  const dispatch = useDispatch();

  return useCallback(
    (source: DataViewerSource) => {
      askMergeMode().then((mode) => {
        if (mode !== 'cancel') {
          dispatch(convertToDataViewer({ source, mode }));
        }
      });
    },
    [askMergeMode, dispatch],
  );
}
