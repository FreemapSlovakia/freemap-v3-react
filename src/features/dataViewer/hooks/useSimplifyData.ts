import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useSimplifyPrompt } from '@shared/simplifyDialog.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { dataViewerSimplify } from '../model/actions.js';

/**
 * Thins the loaded data in place — the one feature `id` names, or all of it —
 * after asking how much. Cancel, and a factor of zero, leave it alone.
 */
export function useSimplifyData(): (id?: number) => Promise<void> {
  const dispatch = useDispatch();

  const askSimplification = useSimplifyPrompt();

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  return useCallback(
    async (id?: number) => {
      const source =
        id === undefined ? trackGeojson : trackGeojson?.features[id];

      if (!source) {
        return;
      }

      const tolerance = await askSimplification({
        lines: convertibleLines(source),
        always: true,
      });

      if (tolerance) {
        dispatch(dataViewerSimplify({ tolerance, id }));
      }
    },
    [askSimplification, dispatch, trackGeojson],
  );
}
