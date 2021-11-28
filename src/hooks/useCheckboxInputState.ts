import { ChangeEvent, useState } from 'react';

export function useCheckboxInputState(
  init: boolean,
): [boolean, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(init);

  return [
    value,
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.currentTarget.checked);
    },
  ];
}
