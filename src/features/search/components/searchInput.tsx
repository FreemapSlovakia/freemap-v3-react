import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import classes from './SearchMenu.module.css';

/** Shorter than this suggests nothing, and searches nothing. */
export const minQueryLength = 3;

/** Long enough that a typed word is one lookup rather than one per letter. */
export const suggestDelayMs = 300;

/**
 * A caret-less dropdown toggle for menus that are driven by an input inside
 * them. The toggle's `onClick` is dropped — the input's focus and the caret
 * button open and close the menu — but the rest of the props, `aria-expanded`
 * above all, must reach the DOM: `Main.tsx` swallows a click on the map while
 * `[aria-expanded=true]` is present anywhere, so a menu that hides it lets the
 * click that dismisses it act on the map as well.
 */
export const HideArrow = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<'span'>
>(({ children, className, onClick: _onClick, ...props }, ref) => {
  return (
    <span {...props} className={clsx(classes.noAfter, className)} ref={ref}>
      {children}
    </span>
  );
});

HideArrow.displayName = 'HideArrow';
