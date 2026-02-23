import storage from 'local-storage-fallback';
import { ChangeEvent, MouseEvent, useCallback, useState } from 'react';
import { useAppSelector } from './useAppSelector.js';

export function usePersistentState<
  T,
  E extends { value: string } = { value: string },
>(
  key: string,
  serialize: (value: T) => string,
  deserialize: (value: string | null) => T,
) {
  const [value, setValue] = useState(deserialize(storage.getItem(key)));

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const setState = useCallback(
    (value: T | ((value: T) => T)) => {
      if (typeof value === 'function') {
        const fn = value as (value: T) => T;

        setValue((prev) => {
          const next = fn(prev);

          if (cookiesEnabled) {
            storage.setItem(key, serialize(next));
          }

          return next;
        });
      } else {
        if (cookiesEnabled) {
          storage.setItem(key, serialize(value));
        }

        setValue(value);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, cookiesEnabled],
  );

  const setFormState = useCallback(
    (evt: ChangeEvent<E> | MouseEvent<E>) => {
      const value = deserialize(evt.currentTarget.value);

      if (cookiesEnabled) {
        storage.setItem(key, serialize(value));
      }

      setValue(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cookiesEnabled, key],
  );

  return [value, setState, setFormState] as const;
}
