import { RootAction } from 'fm3/actions';
import { toastsRemove } from 'fm3/actions/toastsActions';
import { Dispatch } from 'redux';

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
