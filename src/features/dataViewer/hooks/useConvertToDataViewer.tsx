import {
  convertToDataViewer,
  type DataViewerSource,
} from '@app/store/actions.js';
import { useConvertPrompt } from '@shared/convertDialog.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactNode, useCallback } from 'react';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';
import { useDataMergeMode } from './useDataMergeMode.js';

/**
 * Asks how the incoming features should meet what the viewer already holds, then
 * hands them over — the one gesture every menu that converts to "Tracks and
 * data" performs. `geometry` adds the choice between the element's own geometry
 * and the point it is drawn at, which only an OSM object has; the two questions
 * are then one dialog rather than two in a row.
 */
type Options = {
  /** Offer the element's own geometry, which only an OSM object has. */
  geometry?: boolean;
  title?: ReactNode;
};

export function useConvertToDataViewer(): (
  source: DataViewerSource,
  options?: Options,
) => void {
  const askMergeMode = useDataMergeMode();

  const askConversion = useConvertPrompt();

  const dvm = useDataViewerMessages();

  const existing = useAppSelector(
    (state) => state.trackViewer.trackGeojson !== null,
  );

  const dispatch = useDispatch();

  return useCallback(
    (source: DataViewerSource, options?: Options) => {
      if (!options?.geometry) {
        askMergeMode().then((mode) => {
          if (mode !== 'cancel') {
            dispatch(convertToDataViewer({ source, mode }));
          }
        });

        return;
      }

      // Only worth asking where there is something to meet, in the wording
      // `useDataMergeMode` gives it.
      void askConversion({
        title: options.title,
        icon: <MdShapeLine />,
        geometry: true,
        ...(existing && {
          merge: {
            label: dvm?.uploadModal.existingData,
            hint: dvm?.uploadModal.mergeMessage,
            append: dvm?.uploadModal.append,
            replace: dvm?.uploadModal.replace,
          },
        }),
      }).then((choices) => {
        if (!choices) {
          return;
        }

        dispatch(
          convertToDataViewer({
            source:
              choices.geometry === 'full' &&
              source.type === 'objects' &&
              source.id
                ? { type: 'objects-geometry', id: source.id }
                : source,
            mode: choices.mode,
          }),
        );
      });
    },
    [askMergeMode, askConversion, dispatch, dvm, existing],
  );
}
