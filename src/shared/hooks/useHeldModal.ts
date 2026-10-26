import type { ActiveModal } from '@app/store/activeModal.js';
import { useState } from 'react';
import { useAppSelector } from './useAppSelector.js';

/** The modal of `type` as it was opened, with its arguments, held while it fades out. */
export function useHeldModal<T extends NonNullable<ActiveModal>['type']>(
  type: T,
): Extract<ActiveModal, { type: T }> | undefined {
  const current = useAppSelector((state) =>
    state.main.activeModal?.type === type
      ? (state.main.activeModal as Extract<ActiveModal, { type: T }>)
      : undefined,
  );

  const [held, setHeld] = useState(current);

  if (current !== undefined && current !== held) {
    setHeld(current);
  }

  return current ?? held;
}
