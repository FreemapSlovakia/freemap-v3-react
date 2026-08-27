import { convertToDrawing } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useSimplifyPrompt } from '@shared/hooks/useSimplifyPrompt.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { featureKind } from '../provenance.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

/**
 * Turns the loaded data — or the one feature `id` names — into a drawing, after
 * one question: it warns that a recording's per-point data is dropped and asks
 * how much to simplify, filled in from the geometry's own density. Cancel
 * aborts; geometry thin enough to convert whole is asked nothing.
 */
export function useConvertTrackToDrawing(): (id?: number) => void {
  const dispatch = useDispatch();

  const dvm = useDataViewerMessages();

  const askSimplification = useSimplifyPrompt();

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  return useCallback(
    (id?: number) => {
      const source =
        id === undefined ? trackGeojson : trackGeojson?.features[id];

      if (!source) {
        return;
      }

      // A GPS recording (`fm:kind === 'track'`) is the one thing converting can
      // lose data from. Routes and generic imported geometry have nothing rich.
      const dense = (
        source.type === 'Feature' ? [source] : source.features
      ).some((feature) => featureKind(feature) === 'track');

      const tolerance = askSimplification(
        convertibleLines(source),
        dense ? dvm?.convertLossWarning : undefined,
      );

      if (tolerance !== null) {
        dispatch(convertToDrawing({ type: 'track', tolerance, id }));
      }
    },
    [askSimplification, dispatch, dvm, trackGeojson],
  );
}
