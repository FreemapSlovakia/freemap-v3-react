import type { RootState } from '@app/store/store.js';
import { UnknownAction } from '@reduxjs/toolkit';

export type ActionCreatorMatchable = {
  match: (action: UnknownAction) => boolean;
};

/**
 * Conditions that trigger cancellation, mirroring the matching options of the
 * processor middleware so callers reason about cancellation the same way.
 * Provided conditions are combined per `predicatesOperation` (default `OR` —
 * cancel as soon as any fires).
 */
export interface CancelTriggers {
  /** Cancel when one of these action creators matches the dispatched action. */
  cancelActions?: ActionCreatorMatchable[];
  actionPredicate?: (action: UnknownAction) => boolean;
  statePredicate?: (state: RootState) => boolean;
  /** Cancel when the returned value differs between the previous and next state. */
  stateChangePredicate?: (state: RootState) => unknown;
  predicatesOperation?: 'AND' | 'OR';
}

export interface CancelItem extends CancelTriggers {
  cancel: (reason?: string) => void;
}

export const cancelRegister = new Set<CancelItem>();

/**
 * Combines the supplied condition results (skipping `undefined`/absent ones)
 * with the given operation; `OR` (any) by default, matching cancellation's
 * "stop as soon as something invalidates the request" intent.
 */
export function combineResults(
  results: (boolean | undefined)[],
  operation: 'AND' | 'OR' = 'OR',
): boolean {
  const present = results.filter((r): r is boolean => r !== undefined);

  return (
    present.length > 0 &&
    (operation === 'AND' ? present.every(Boolean) : present.some(Boolean))
  );
}

/** Evaluates the trigger conditions against a dispatched action and state. */
export function cancelTriggered(
  triggers: CancelTriggers,
  action: UnknownAction,
  prevState: RootState,
  state: RootState,
): boolean {
  const { stateChangePredicate } = triggers;

  return combineResults(
    [
      triggers.cancelActions?.some((c) => c.match(action)),
      triggers.actionPredicate?.(action),
      triggers.statePredicate?.(state),
      stateChangePredicate
        ? stateChangePredicate(state) !== stateChangePredicate(prevState)
        : undefined,
    ],
    triggers.predicatesOperation,
  );
}
