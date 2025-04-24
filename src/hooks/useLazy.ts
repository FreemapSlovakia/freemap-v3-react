import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { startProgress, stopProgress } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';

export function useLazy<T>(
  factory: () => Promise<{ default: T }>,
  load = true,
): T | undefined {
  const [modal, setModal] = useState<T>();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!load) {
      return;
    }

    let pid: number | undefined = undefined;

    let loaded = false;

    setTimeout(() => {
      if (!loaded) {
        pid = Math.random();

        dispatch(startProgress(pid));
      }
    });

    factory()
      .then(
        (m) => {
          loaded = true;

          // NOTE m.default is function and so we can't pass it directly
          setModal(() => m.default);
        },
        (err) => {
          dispatch(
            toastsAdd({
              style: 'danger',
              messageKey: 'general.componentLoadingError',
              messageParams: { err },
            }),
          );
        },
      )
      .finally(() => {
        if (pid) {
          dispatch(stopProgress(pid));
        }
      });
  }, [load, dispatch, factory]);

  return modal;
}
