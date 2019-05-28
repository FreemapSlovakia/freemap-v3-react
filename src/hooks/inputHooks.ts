import { FormControl } from 'react-bootstrap';
import { FormEvent, useState } from 'react';

export function useTextInputState(
  init: string,
): [string, (e: FormEvent<FormControl>) => void] {
  const [value, setValue] = useState(init);
  return [
    value,
    (e: FormEvent<FormControl>) => {
      setValue((e.target as HTMLInputElement).value);
    },
  ];
}

export function useCheckboxInputState(
  init: boolean,
): [boolean, (e: FormEvent<FormControl>) => void] {
  const [value, setValue] = useState(init);
  return [
    value,
    (e: FormEvent<FormControl>) => {
      setValue((e.target as HTMLInputElement).checked);
    },
  ];
}
