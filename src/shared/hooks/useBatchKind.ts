import type { BatchKind } from '@shared/batchProperties.js';
import { useState } from 'react';
import { useAppSelector } from './useAppSelector.js';

/** The kind a batch modal was opened for, held while it fades out. */
export function useBatchKind(
  type: 'drawing-batch-properties' | 'data-viewer-batch-properties',
): BatchKind | undefined {
  const current = useAppSelector((state) =>
    state.main.activeModal?.type === type
      ? state.main.activeModal.kind
      : undefined,
  );

  const [held, setHeld] = useState(current);

  if (current !== undefined && current !== held) {
    setHeld(current);
  }

  return current ?? held;
}
