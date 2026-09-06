import { convertToDrawing } from '@app/store/actions.js';
import {
  conversionSeed,
  featuresOf,
  useConvertPrompt,
} from '@shared/convertDialog.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { featureKind } from '../provenance.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

/**
 * Turns the loaded data — or the one feature `id` names — into a drawing, after
 * one dialog: what each feature takes along, the label it gets, and how much to
 * simplify, filled in from the geometry's own density. It warns first that a
 * recording's per-point data is dropped. Cancel aborts.
 */
export function useConvertTrackToDrawing(): (id?: number) => Promise<void> {
  const dispatch = useDispatch();

  const dvm = useDataViewerMessages();

  const askConversion = useConvertPrompt();

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

      const features = featuresOf(source);

      // A GPS recording (`fm:kind === 'track'`) is the one thing converting can
      // lose data from. Routes and generic imported geometry have nothing rich.
      const dense = features.some(
        (feature) => featureKind(feature) === 'track',
      );

      const choices = await askConversion({
        preamble: dense ? dvm?.convertLossWarning : undefined,
        lines: convertibleLines(source),
        // A loaded line's name is drawn as its label, so the seed offers it.
        ...conversionSeed(features, true),
      });

      if (choices) {
        dispatch(
          convertToDrawing({
            type: 'track',
            tolerance: choices.tolerance,
            id,
            carry: choices.carry,
          }),
        );
      }
    },
    [askConversion, dispatch, dvm, trackGeojson],
  );
}
