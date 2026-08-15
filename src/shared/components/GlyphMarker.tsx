import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import clsx from 'clsx';
import type {
  HTMLAttributes,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';

type Props = Omit<HTMLAttributes<HTMLElement>, 'children' | 'color'> & {
  /** The glyph — one icon element. */
  children: ReactNode;
  /** What the mark means; hover or touch long-press reveals it. */
  hint?: ReactNode;
  /** Bootstrap text-colour suffix for the glyph; `null` keeps the surrounding colour. */
  color?: string | null;
  /** Step off the icon scale. `md` is what a button's own icon comes out at. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Text rendered before the glyph as part of the same mark — for inline use in
   * running text. It keeps the mark wrappable, so the glyph is not held on the
   * same line as the words, and only the glyph takes `color`.
   */
  label?: ReactNode;
  /** Renders an `<a>` instead of a `<span>`. */
  href?: string;
  /**
   * Leaves out the air and the hit area, for a mark that already sits in a box
   * of its own (a badge with button clothes) — that box is its target, and the
   * padding would only make it a different shape.
   */
  bare?: boolean;
  /**
   * Overrides what the cursor says — `help` unless the mark has a handler of its
   * own. Set `pointer` for a mark acted on by its container's handler instead.
   */
  cursor?: 'help' | 'pointer';
};

const sizeClass = { sm: 'fm-icon-sm', md: 'fm-icon', lg: 'fm-icon-lg' };

/**
 * A glyph that stands for a state or an offer — offline, premium, experimental,
 * unsaved — with what it means in a tooltip, since a toolbar or a menu row has no
 * room to write it out. One place decides the three things such a mark keeps
 * getting wrong per call site: the glyph's size, a hit area a fingertip can land
 * on, and pointer events inside a disabled container.
 *
 * `onClick` / `onClickCapture` are composed with the tooltip's own capture
 * handler, so a click that merely ended a long-press arrives with
 * `defaultPrevented` set rather than acting.
 */
export function GlyphMarker({
  children,
  hint,
  color = 'warning',
  size = 'md',
  label,
  href,
  bare,
  cursor,
  className,
  onClick,
  onClickCapture,
  ...rest
}: Props): ReactElement {
  const acts = Boolean(onClick || onClickCapture || href);

  const glyphClass = clsx(sizeClass[size], color && `text-${color}`);

  // Without a label the mark is the glyph, so it wears the glyph's classes
  // itself; with one, only the glyph inside does.
  const content =
    label == null ? (
      children
    ) : (
      <>
        {label} <span className={glyphClass}>{children}</span>
      </>
    );

  return (
    <LongPressTooltip label={hint}>
      {({ props }) => {
        const shared = {
          ...rest,
          ...props,
          className: clsx(
            'fm-marker',
            !bare && 'fm-marker-air',
            // A label makes the mark a phrase, which has to be able to wrap;
            // without one the mark is the glyph, and `fm-glyph` makes its box
            // exactly that.
            label == null && `fm-glyph ${glyphClass}`,
            `fm-cursor-${cursor ?? (acts ? 'pointer' : 'help')}`,
            className,
          ),
          onClick,
          onClickCapture: (e: MouseEvent<HTMLElement>) => {
            props.onClickCapture(e);

            onClickCapture?.(e);
          },
        };

        return href ? (
          <a {...shared} href={href}>
            {content}
          </a>
        ) : (
          <span {...shared}>{content}</span>
        );
      }}
    </LongPressTooltip>
  );
}
