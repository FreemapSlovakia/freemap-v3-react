import { ChangeEvent, useState } from 'react';

export function useTextInputState(
  init: string,
): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(init);
  return [
    value,
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.currentTarget.value);
    },
  ];
}
