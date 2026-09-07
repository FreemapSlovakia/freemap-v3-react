import { type RefObject, useCallback } from 'react';

/**
 * Writes an expression into a text field at the caret, and leaves the caret
 * after it so several in a row read in the order they were pressed.
 */
export function useInsertAtCaret(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  setText: (update: (text: string) => string) => void,
): (expression: string) => void {
  return useCallback(
    (expression: string) => {
      const el = ref.current;

      // A field reports a selection of 0..0 whether the caret is genuinely at
      // the start or has never been in it at all, so being focused is what
      // tells a caret to write at from no caret to append after.
      const caret =
        el && document.activeElement === el
          ? { at: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 }
          : undefined;

      let to = 0;

      setText((text) => {
        const { at, end } = caret ?? { at: text.length, end: text.length };

        to = at + expression.length;

        return text.slice(0, at) + expression + text.slice(end);
      });

      if (el) {
        requestAnimationFrame(() => {
          el.focus();

          el.setSelectionRange(to, to);
        });
      }
    },
    [ref, setText],
  );
}
