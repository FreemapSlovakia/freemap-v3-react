import { PROPERTY_PREFIX } from '@features/drawing/interpolateLabel.js';
import type { ReactNode } from 'react';
import classes from './PlaceholderHint.module.css';

type Props = {
  text: string | undefined;
  /**
   * Writes an expression into the field the hint is about. Only the computed
   * keys are offered: a `{p:key}` here is an example naming a property the
   * feature may not have.
   */
  onInsert?: (expression: string) => void;
};

/** An unbroken run of `{token}` and `[optional]` parts, as written in a label. */
const EXPRESSION = /((?:\{[^{}]*\}|\[[^[\]]*\])+)/;

/** An expression the user clicks to write it into the field. */
export function InsertToken({
  expression,
  onInsert,
}: {
  expression: string;
  onInsert: (expression: string) => void;
}): ReactNode {
  return (
    <button
      type="button"
      className={classes.token}
      onClick={() => onInsert(expression)}
    >
      <code>{expression}</code>
    </button>
  );
}

/**
 * Renders a hint whose label expressions are set in `<code>`, so every locale
 * can keep them as plain strings.
 */
export function PlaceholderHint({ text, onInsert }: Props): ReactNode {
  return text?.split(EXPRESSION).map((part, i) => {
    // Odd parts are the captured runs; one without a token is prose, as in
    // "put it in [square brackets]".
    if (i % 2 === 0 || !part.includes('{')) {
      return part;
    }

    return onInsert && !part.includes(`{${PROPERTY_PREFIX}`) ? (
      <InsertToken key={i} expression={part} onInsert={onInsert} />
    ) : (
      <code key={i}>{part}</code>
    );
  });
}
