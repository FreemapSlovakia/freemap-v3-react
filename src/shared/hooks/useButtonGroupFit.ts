import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import classes from './useButtonGroupFit.module.css';

/**
 * How much of the line a group has to want before it takes the whole of it
 * rather than leaving the remainder as a ragged edge.
 */
const FILL_FROM = 0.85;

/** Spread onto the `ButtonGroup` / `ToggleButtonGroup` it decides for. */
export type ButtonGroupFit = {
  ref: (el: HTMLElement | null) => void;
  vertical: boolean;
  className?: string;
};

/**
 * Fits a joined button group to its line, by what it measures rather than by a
 * breakpoint — label lengths change with the language. Spread the result onto
 * the group. Three outcomes: a group that fits with room to spare keeps its own
 * width; one that nearly fills the line takes all of it; one that no longer
 * fits at all stacks, and fills the line too.
 *
 * The group has to be alone on its line and its parent a block: the room to
 * work with is read as the width the parent gives the group when block-level.
 */
export function useButtonGroupFit(): ButtonGroupFit {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const [vertical, setVertical] = useState(false);

  const [fill, setFill] = useState(false);

  const measure = useCallback(() => {
    if (!el?.isConnected) {
      return;
    }

    el.classList.add(classes.measureAvailable);

    const available = el.getBoundingClientRect().width;

    el.classList.remove(classes.measureAvailable);

    if (!available) {
      return; // laid out nowhere, so there is nothing to compare against
    }

    // Measured as a horizontal group, so the borders overlap the way they will
    // once it renders as one.
    const stacked = el.classList.replace('btn-group-vertical', 'btn-group');

    el.classList.add(classes.measureRequired);

    const required = el.getBoundingClientRect().width;

    el.classList.remove(classes.measureRequired);

    if (stacked) {
      el.classList.replace('btn-group', 'btn-group-vertical');
    }

    // Neither reading depends on the outcome, so the two can never chase each
    // other across the thresholds.
    setVertical(required > available);

    setFill(required >= available * FILL_FROM);
  }, [el]);

  // Every render: labels change with the language, and buttons come and go.
  useLayoutEffect(measure);

  useEffect(() => {
    const parent = el?.parentElement;

    if (!parent || !window.ResizeObserver) {
      return;
    }

    const ro = new ResizeObserver(measure);

    ro.observe(parent);

    return () => ro.disconnect();
  }, [el, measure]);

  return {
    ref: setEl,
    vertical,
    // Stacked, every button is the group's width anyway; nearly filling, the
    // remainder reads as a ragged edge against the fields above and below.
    // `d-flex` rather than `w-100`, whose `!important` would fight the
    // measuring classes.
    className: fill ? 'd-flex' : undefined,
  };
}
