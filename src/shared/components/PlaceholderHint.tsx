import type { ReactNode } from 'react';

type Props = {
  text: string | undefined;
};

/** An unbroken run of `{token}` and `[optional]` parts, as written in a label. */
const EXPRESSION = /((?:\{[^{}]*\}|\[[^[\]]*\])+)/;

/**
 * Renders a hint whose label expressions are set in `<code>`, so every locale
 * can keep them as plain strings.
 */
export function PlaceholderHint({ text }: Props): ReactNode {
  return text?.split(EXPRESSION).map((part, i) =>
    // Odd parts are the captured runs; one without a token is prose, as in
    // "put it in [square brackets]".
    i % 2 === 1 && part.includes('{') ? <code key={i}>{part}</code> : part,
  );
}
