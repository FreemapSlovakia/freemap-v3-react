import { ChangeEvent, useMemo, useRef } from 'react';

type ControlChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export function useModelChangeHandlers<T extends object>(
  setModel: (updater: (prev: T) => T) => void,
): { [K in keyof T]: (e: ControlChangeEvent) => void } {
  const cache = useRef<
    Partial<Record<keyof T, (e: ControlChangeEvent) => void>>
  >({});

  return useMemo(
    () =>
      new Proxy({} as { [K in keyof T]: (e: ControlChangeEvent) => void }, {
        get: (_, key) => {
          const k = key as keyof T;

          return (cache.current[k] ??= (e) => {
            const { type, value, checked } =
              e.currentTarget as HTMLInputElement;

            setModel((model) => ({
              ...model,
              [k]: type === 'checkbox' ? checked : value,
            }));
          });
        },
      }),
    [setModel],
  );
}
