import clsx from 'clsx';
import type { ReactElement } from 'react';
import {
  ButtonGroup,
  type ButtonGroupProps,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
} from 'react-bootstrap';
import { useButtonGroupFit } from '../hooks/useButtonGroupFit.js';

/**
 * A `ButtonGroup` that stacks rather than wrapping text inside its buttons once
 * it doesn't fit — see `useButtonGroupFit`. Only for a group alone on its line.
 */
export function FitButtonGroup({
  className,
  ...rest
}: Omit<ButtonGroupProps, 'vertical'>): ReactElement {
  const fit = useButtonGroupFit();

  return (
    <ButtonGroup
      {...rest}
      ref={fit.ref}
      vertical={fit.vertical}
      className={clsx(className, fit.className)}
    />
  );
}

/** {@link FitButtonGroup} for a `ToggleButtonGroup`. */
export function FitToggleButtonGroup<T>({
  className,
  ...rest
}: ToggleButtonGroupProps<T>): ReactElement {
  const fit = useButtonGroupFit();

  return (
    <ToggleButtonGroup
      {...rest}
      ref={fit.ref}
      vertical={fit.vertical}
      className={clsx(className, fit.className)}
    />
  );
}
