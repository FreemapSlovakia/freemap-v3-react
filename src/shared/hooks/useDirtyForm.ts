import { addLeaveReason } from '@shared/leaveGuard.js';
import { addCloseGuard } from '@shared/modalCloseGuard.js';
import { createContext, use, useEffect, useState } from 'react';

/**
 * Whether the modal around is shown: `AsyncModal` keeps a closed one mounted
 * while it fades out, and what it holds is no longer the user's to lose.
 */
export const ModalShownContext = createContext(true);

/**
 * While `dirty` holds and its modal is shown, the user's dismissals
 * (`askBeforeClosing`, `FmDismissButton`, Back) and leaving the page ask first.
 */
export function useDirtyForm(dirty: boolean): void {
  const active = dirty && use(ModalShownContext);

  useEffect(() => {
    if (!active) {
      return;
    }

    const removeLeave = addLeaveReason(() => true);

    const removeClose = addCloseGuard();

    return () => {
      removeLeave();

      removeClose();
    };
  }, [active]);
}

/** Whether `value` differs from what it was on the first render. */
export function useDirtySince(value: unknown): boolean {
  const current = JSON.stringify(value);

  const [seeded] = useState(current);

  return current !== seeded;
}
