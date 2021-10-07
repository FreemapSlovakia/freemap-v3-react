import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export function useLazyComponent<T>(
  factory: () => Promise<{ default: T }>,
  load: boolean,
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

    // NOTE factory dependenct is disabled for simpler parent code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, dispatch]);

  return modal;
}
