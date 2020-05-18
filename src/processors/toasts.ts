import { toastsRemove } from 'fm3/actions/toastsActions';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

export const timeoutMap = new Map<
  string,
  { timeoutId: number; dispatch: Dispatch<RootAction> }
>();

export function setupTimeout(
  id: string,
  timeout: number,
  dispatch: Dispatch<RootAction>,
) {
  const timeoutId = window.setTimeout(() => {
    timeoutMap.delete(id);
    dispatch(toastsRemove(id));
  }, timeout);

  timeoutMap.set(id, {
    timeoutId,
    dispatch,
  });
}

export function removeTimeout(id: string) {
  const tm = timeoutMap.get(id);
  if (tm) {
    timeoutMap.delete(id);
    clearTimeout(tm.timeoutId);
  }
}
