import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { mapPickClear } from './model/actions.js';

/**
 * Drops the staged pick when its mode ends. Both the mode's menu and its marker
 * call it: they load as separate chunks, and either may never mount.
 */
export function useClearMapPickOnLeave(): void {
  const dispatch = useDispatch();

  useEffect(
    () => () => {
      dispatch(mapPickClear());
    },
    [dispatch],
  );
}
