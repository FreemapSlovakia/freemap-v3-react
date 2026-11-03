import { useConfirmChoice } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { mapHasContentSelector } from '../model/selectors.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

/**
 * Asks whether a map being loaded joins what is on the map or replaces it:
 * `true` to merge, `false` to replace, `null` when cancelled. On an empty map
 * both do the same thing, so it doesn't ask.
 */
export function useAskLoadMerge(): () => Promise<boolean | null> {
  const confirmChoice = useConfirmChoice();

  const mm = useMyMapsMessages();

  const hasContent = useAppSelector(mapHasContentSelector);

  return async () => {
    if (!hasContent) {
      return false;
    }

    const choice = await confirmChoice({
      title: mm?.loadMergeModal.title,
      message: mm?.loadMergeModal.message,
      confirmLabel: mm?.loadMergeModal.append,
      extraLabel: mm?.loadMergeModal.replace,
      extraStyle: 'danger',
    });

    return choice === 'cancel' ? null : choice === 'confirm';
  };
}
