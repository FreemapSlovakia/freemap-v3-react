import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
} from 'react';
import classes from './SelectToggle.module.css';

// Dropdown.Toggle styled as a native-like <select> (border + caret) for forms.
// `.form-select` draws its own caret, so drop Bootstrap's `dropdown-toggle`
// class to avoid a second caret from its `::after`.
export const SelectToggle = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'>
>(({ children, className, ...props }, ref): ReactElement => {
  const extra = (className ?? '')
    .split(' ')
    .filter((c) => c && c !== 'dropdown-toggle')
    .join(' ');

  return (
    <button
      type="button"
      ref={ref}
      className={`form-select text-start ${classes.toggle}${extra ? ` ${extra}` : ''}`}
      {...props}
    >
      {children}
    </button>
  );
});

SelectToggle.displayName = 'SelectToggle';
