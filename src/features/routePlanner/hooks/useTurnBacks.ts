import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';
import { routeKey } from '../model/actions.js';
import { turnBacks } from '../model/shaping.js';

/** The active route's shaping points it turns back at (see `turnBacks`). */
export function useTurnBacks(): Set<number> {
  const points = useAppSelector((state) => state.routePlanner.points);

  const mode = useAppSelector((state) => state.routePlanner.mode);

  // Only a result for the points on screen: a moved point's old legs would
  // still match them in number.
  const legs = useAppSelector((state) =>
    state.routePlanner.resultKey === routeKey(state.routePlanner)
      ? state.routePlanner.alternatives[
          state.routePlanner.activeAlternativeIndex
        ]?.legs
      : undefined,
  );

  return useMemo(
    () => turnBacks(points, mode, legs ?? []),
    [points, mode, legs],
  );
}
