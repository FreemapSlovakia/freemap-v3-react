import { setActiveModal } from '@app/store/actions.js';
import { askBeforeClosing } from '@shared/modalCloseGuard.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useDispatch } from 'react-redux';

/**
 * Opens the manual at a chapter, counted under where it was opened from.
 * The chapter is a `src/manual/<chapter>.<lang>.md` key; an unknown one opens
 * the first.
 */
export function useOpenManual(
  from: 'toolbar' | 'modal' | 'window' | 'panel',
): (chapter: string) => void {
  const dispatch = useDispatch();

  // It replaces the modal it is opened from, a form being edited included.
  return (chapter) =>
    askBeforeClosing(() => {
      trackMatomo(['trackEvent', 'Manual', from, chapter]);

      dispatch(setActiveModal({ type: 'manual', chapter }));
    });
}
