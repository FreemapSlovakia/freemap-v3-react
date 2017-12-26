import { toastsRemove } from 'fm3/actions/toastsActions';

export const timeoutMap = new Map();

export function setupTimeout(id, timeout, dispatch, done) {
  const timeoutId = setTimeout(() => {
    timeoutMap.delete(id);
    dispatch(toastsRemove(id));
    done();
  }, timeout);

  timeoutMap.set(id, {
    timeoutId,
    done,
    dispatch,
  });
}

export function removeTimeout(id) {
  const tm = timeoutMap.get(id);
  if (tm) {
    timeoutMap.delete(id);
    clearTimeout(tm.timeoutId);
    tm.done();
  }
}
