import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';
import { turnBacks } from '../model/shaping.js';

/** The active route's shaping points it turns back at (see `turnBacks`). */
export function useTurnBacks(): Set<number> {
  const points = useAppSelector((state) => state.routePlanner.points);

  const mode = useAppSelector((state) => state.routePlanner.mode);

  const legs = useAppSelector(
    (state) =>
      state.routePlanner.alternatives[state.routePlanner.activeAlternativeIndex]
        ?.legs,
  );

  return useMemo(
    () => turnBacks(points, mode, legs ?? []),
    [points, mode, legs],
  );
}
