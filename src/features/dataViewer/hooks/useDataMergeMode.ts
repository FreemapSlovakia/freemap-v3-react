import { useConfirmChoice } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCallback } from 'react';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

export type DataMergeMode = 'replace' | 'append' | 'cancel';

/**
 * Asks how incoming geodata should meet what the track viewer already holds,
 * and answers `replace` without asking when it holds nothing.
 *
 * Shared by every route into the viewer — the import modal, the app-wide file
 * drop, and saving a GPS recording — so the question, its wording and its
 * defaults are the same however the data arrives. Append is the safe default
 * (confirm / Enter); replace is the destructive option.
 */
export function useDataMergeMode(): () => Promise<DataMergeMode> {
  const confirmChoice = useConfirmChoice();

  const tvm = useDataViewerMessages();

  const existing = useAppSelector((state) => state.trackViewer.trackGeojson);

  return useCallback(async () => {
    if (!existing) {
      return 'replace';
    }

    const choice = await confirmChoice({
      title: tvm?.uploadModal.mergeTitle,
      message: tvm?.uploadModal.mergeMessage,
      confirmLabel: tvm?.uploadModal.append,
      extraLabel: tvm?.uploadModal.replace,
      extraStyle: 'danger',
    });

    return choice === 'cancel'
      ? 'cancel'
      : choice === 'extra'
        ? 'replace'
        : 'append';
  }, [confirmChoice, tvm, existing]);
}
