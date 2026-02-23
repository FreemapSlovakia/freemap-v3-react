import { Dispatch } from 'redux';
import type { RootAction } from '@app/store/rootAction.js';
import { toastsRemove } from '../actions.js';

export const timeoutMap = new Map<
  string,
  { timeoutId: number | null; dispatch: Dispatch<RootAction> }
>();

export function setupTimeout(
  id: string,
  timeout: number,
  dispatch: Dispatch<RootAction>,
): void {
  const timeoutId = window.setTimeout(() => {
    timeoutMap.delete(id);

    dispatch(toastsRemove(id));
  }, timeout);

  timeoutMap.set(id, {
    timeoutId,
    dispatch,
  });
}

export function removeTimeout(id: string): void {
  const tm = timeoutMap.get(id);

  if (tm?.timeoutId != null) {
    timeoutMap.delete(id);

    clearTimeout(tm.timeoutId);
  }
}
